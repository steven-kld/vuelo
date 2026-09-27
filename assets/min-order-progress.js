if (!customElements.get('min-order-progress')) {
  customElements.define(
    'min-order-progress',
    class MinOrderProgress extends HTMLElement {
      connectedCallback() {
        this.productInfo = this.closest('product-info');
        this.data = this.readData(this);
        if (!this.productInfo || !this.data) return;

        this.textElement = this.querySelector('.min-order-progress__text');
        this.barElement = this.querySelector('.min-order-progress__bar');
        this.fillElement = this.querySelector('.min-order-progress__fill');
        this.amountElement = this.querySelector('.min-order-progress__amount');
        this.pending = false;

        this.onQuantityInput = (event) => {
          if (event.target.matches?.('.quantity__input')) this.update();
        };
        this.productInfo.addEventListener('change', this.onQuantityInput);
        this.productInfo.addEventListener('input', this.onQuantityInput);

        this.onPageShow = (event) => {
          if (event.persisted) this.refreshCart();
        };
        window.addEventListener('pageshow', this.onPageShow);

        this.unsubscribers = [
          subscribe(PUB_SUB_EVENTS.quantityUpdate, () => this.update()),
          subscribe(PUB_SUB_EVENTS.optionValueSelectionChange, (event) => this.onOptionValueChange(event)),
          subscribe(PUB_SUB_EVENTS.variantChange, (event) => this.onVariantChange(event)),
        ];

        this.setupTooltip();
        this.update();
      }

      disconnectedCallback() {
        this.teardownTooltip();
        this.productInfo?.removeEventListener('change', this.onQuantityInput);
        this.productInfo?.removeEventListener('input', this.onQuantityInput);
        if (this.onPageShow) window.removeEventListener('pageshow', this.onPageShow);
        this.unsubscribers?.forEach((unsubscribe) => unsubscribe());
      }

      readData(root) {
        const script = root.querySelector('script[data-min-order-data]');
        if (!script) return null;
        try {
          return JSON.parse(script.textContent);
        } catch (e) {
          return null;
        }
      }

      // Пока карточка грузит новый вариант — держим прежнее состояние до variant-change (без мигания)
      onOptionValueChange({ data } = {}) {
        if (!data?.event || !this.productInfo.contains(data.event.target)) return;
        this.pending = true;
      }

      onVariantChange({ data } = {}) {
        if (!this.pending || !data?.html || data.sectionId !== this.productInfo.sectionId) return;
        const source = data.html.querySelector('min-order-progress');
        const next = source && this.readData(source);
        if (!next || next.productId !== this.data.productId) return;

        this.data = next;
        this.pending = false;
        this.update();
      }

      // Возврат «назад» из корзины (bfcache): сумма и количество в корзине могли измениться
      refreshCart() {
        fetch(`${window.routes?.cart_url || '/cart'}.js`, { headers: { Accept: 'application/json' } })
          .then((response) => response.json())
          .then((cart) => {
            this.data.cartTotal = cart.total_price;
            this.data.cartQty = cart.items
              .filter((item) => item.variant_id === this.data.variantId)
              .reduce((sum, item) => sum + item.quantity, 0);
            this.update();
          })
          .catch((e) => console.error(e));

        this.productInfo.fetchQuantityRules?.();
      }

      update() {
        const data = this.data;
        if (this.pending) return;
        if (!data?.available) {
          this.stockText = null;
          this.hideTooltip();
          return this.render(null);
        }

        const input = this.productInfo.querySelector('.quantity__input');
        const limit = typeof data.limit === 'number' ? data.limit : null;
        const maxAdd = limit === null ? null : Math.max(limit - data.cartQty, 0);

        let qty = parseInt(input?.value, 10);
        if (isNaN(qty) || qty < 0) qty = 0;
        if (maxAdd !== null) qty = Math.min(qty, maxAdd);

        const price = data.price || 0;
        const projected = data.cartTotal + qty * price;
        const missing = data.threshold - projected;
        const texts = data.texts;
        let text;

        // Функция вместо строки: в суммах есть «$», который replace иначе трактует как шаблон
        const fill = (template) =>
          template
            .replace('{N}', () => limit)
            .replace('{K}', () => data.cartQty)
            .replace('{T}', () => data.thresholdFormatted)
            .replace('{Y}', () => this.formatMoney(Math.max(missing, 0), data.moneyFormat));

        this.updateSelectedNote(qty);

        // Остаток склада исчерпан выбором/корзиной — текст для подсказки у «+»
        this.stockText = null;
        if (data.stockLimited && maxAdd !== null && qty >= maxAdd) {
          if (maxAdd === 0) this.stockText = fill(texts.stockAllInCart);
          else if (data.cartQty > 0) this.stockText = fill(texts.stockWithCart);
          else this.stockText = fill(texts.stockOnly);
        }
        if (this.stockText) {
          if (this.tooltip && !this.tooltip.hidden) this.tooltip.textContent = this.stockText;
        } else {
          this.hideTooltip();
        }

        if (this.stockText && missing > 0) {
          text = this.stockText;
        } else if (data.cartTotal >= data.threshold) {
          text = texts.reached;
        } else if (missing <= 0) {
          text = texts.selectionCompletes;
        } else {
          const stems = price > 0 ? Math.ceil(missing / price) : 0;
          if ((stems === 1 || stems === 2) && (maxAdd === null || qty + stems <= maxAdd)) {
            text = stems === 1 ? texts.oneMore : texts.twoMore;
          } else if (data.cartTotal === 0) {
            text = texts.minimum;
          } else {
            text = texts.missing;
          }
        }

        this.render(
          fill(text),
          projected / data.threshold,
          this.formatMoney(projected, data.moneyFormat),
          data.cartTotal >= data.threshold
        );
      }

      // «Cantidad (3 en el carrito + 4 en tu selección)»: метку перерисовывает product-info.js,
      // поэтому элемент ищем заново при каждом пересчёте
      updateSelectedNote(qty) {
        const note = this.productInfo.querySelector('.quantity__selected-note');
        if (!note?.dataset.template) return;
        note.textContent = note.dataset.template.replace('{S}', () => qty);
        note.hidden = qty === 0;
      }

      setupTooltip() {
        this.plusButton = this.productInfo.querySelector('.quantity__button[name="plus"]');
        this.tooltipHost = this.plusButton?.closest('quantity-input');
        if (!this.tooltipHost) return;

        this.tooltip = document.createElement('span');
        this.tooltip.className = 'min-order-progress__tooltip caption';
        this.tooltip.setAttribute('role', 'status');
        this.tooltip.hidden = true;
        this.tooltipHost.classList.add('min-order-progress__tooltip-host');
        this.tooltipHost.append(this.tooltip);

        this.onPlusEnter = () => this.showTooltip();
        this.onPlusLeave = () => this.hideTooltip();
        // Нажатие (в т.ч. на телефоне): показать и спрятать через 2,5 с
        this.onPlusClick = () => {
          if (!this.showTooltip()) return;
          clearTimeout(this.tooltipTimer);
          this.tooltipTimer = setTimeout(() => this.hideTooltip(), 2500);
        };
        this.plusButton.addEventListener('mouseenter', this.onPlusEnter);
        this.plusButton.addEventListener('focus', this.onPlusEnter);
        this.plusButton.addEventListener('mouseleave', this.onPlusLeave);
        this.plusButton.addEventListener('blur', this.onPlusLeave);
        this.plusButton.addEventListener('click', this.onPlusClick);
      }

      teardownTooltip() {
        clearTimeout(this.tooltipTimer);
        if (!this.plusButton || !this.tooltip) return;
        this.plusButton.removeEventListener('mouseenter', this.onPlusEnter);
        this.plusButton.removeEventListener('focus', this.onPlusEnter);
        this.plusButton.removeEventListener('mouseleave', this.onPlusLeave);
        this.plusButton.removeEventListener('blur', this.onPlusLeave);
        this.plusButton.removeEventListener('click', this.onPlusClick);
        this.tooltip.remove();
        this.tooltipHost.classList.remove('min-order-progress__tooltip-host');
      }

      showTooltip() {
        if (!this.tooltip || !this.stockText) return false;
        this.tooltip.textContent = this.stockText;
        this.tooltip.hidden = false;
        return true;
      }

      hideTooltip() {
        if (this.tooltip) this.tooltip.hidden = true;
      }

      // Недоступный вариант — visibility: hidden через модификатор, место под блок остаётся.
      // В полосе — корзина + выбор. Корзина уже ≥ минимума — полоса скрыта (--hidden);
      // иначе зелёная (--complete), когда выбор добирает минимум.
      render(text, ratio = 0, amount = '', cartReached = false) {
        this.classList.toggle('min-order-progress--unavailable', text === null);
        if (text === null) return;
        this.textElement.textContent = text;
        this.fillElement.style.width = `${Math.min(Math.max(ratio, 0), 1) * 100}%`;
        this.amountElement.textContent = amount;
        this.barElement.classList.toggle('min-order-progress__bar--hidden', cartReached);
        this.barElement.classList.toggle('min-order-progress__bar--complete', !cartReached && ratio >= 1);
      }

      // По образцу Shopify.formatMoney; суммы в сотых
      formatMoney(cents, format) {
        const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
        const formatString = (format || '${{amount}}').replace(/<[^>]*>/g, '');

        const formatWithDelimiters = (number, precision = 2, thousands = ',', decimal = '.') => {
          if (isNaN(number) || number == null) return '0';
          const [units, fraction] = (number / 100).toFixed(precision).split('.');
          return units.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${thousands}`) + (fraction ? decimal + fraction : '');
        };

        let value = '';
        switch (formatString.match(placeholderRegex)?.[1]) {
          case 'amount':
            value = formatWithDelimiters(cents, 2);
            break;
          case 'amount_no_decimals':
            value = formatWithDelimiters(cents, 0);
            break;
          case 'amount_with_comma_separator':
            value = formatWithDelimiters(cents, 2, '.', ',');
            break;
          case 'amount_no_decimals_with_comma_separator':
            value = formatWithDelimiters(cents, 0, '.', ',');
            break;
          case 'amount_with_apostrophe_separator':
            value = formatWithDelimiters(cents, 2, "'", '.');
            break;
          case 'amount_no_decimals_with_space_separator':
            value = formatWithDelimiters(cents, 0, ' ', '');
            break;
          case 'amount_with_space_separator':
            value = formatWithDelimiters(cents, 2, ' ', ',');
            break;
          case 'amount_with_period_and_space_separator':
            value = formatWithDelimiters(cents, 2, ' ', '.');
            break;
          default:
            value = formatWithDelimiters(cents, 2);
        }

        return formatString.replace(placeholderRegex, value);
      }
    }
  );
}
