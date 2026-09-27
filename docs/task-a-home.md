# Блок A: главная страница

Главная должна за первый экран сказать что, для кого и что клиент получает, и показать слово «por tallo»,
по которому идёт реклама. Сейчас hero — красивая игра бренда без оффера, а две равные кнопки
(«Ver todo» и «Comprar por categorías») делят внимание.

## A1. Hero
| Элемент | Сейчас | Сделать |
|---|---|---|
| Заголовок (h1) | «Flores frescas sin escalas» стоит после подзаголовка; h1 занят логотипом | «Flores frescas sin escalas» первым, размечен как h1 контента |
| Подзаголовок | Tallos frescos de productores seleccionados en Colombia, Ecuador y flores de estación. Elige las variedades y cantidades que quieras y crea tu propia composición. | Flores frescas por tallo, directo de Ecuador y Colombia. Elige las variedades y la cantidad que quieras — sin pagar de más por diseño ni empaque. Pide antes de las 17:00 y llega mañana. |
| Кнопки | «Ver todo» + «Comprar por categorías», равного веса | Одна доминантная «Comprar por tallo» → весь каталог; под ней две текстовые ссылки «Por largo de tallo» и «Por especie» |
| Условия | Мин. заказ не виден у первого CTA | Строка у кнопки: «Pedido mínimo $28.000 · despacho según comuna» со ссылкой на тарифы |
Ограничения: «sin pagar de más…» — только после расчёта экономии; «Por especie» — после блока B.

## A2. Строка стойкости и гарантии под hero
Текст: «Flores que duran hasta [X] días en florero — no los 3 del supermercado. Y si no, te las reponemos.»
[X] и гарантия не подтверждены — ждёт заказчика.

## A3. Блок «Cómo funciona» (модель)
Заголовок: «Elige las flores. Nosotros las llevamos frescas.»
Текст: «Compra las variedades y cantidades de tallos que quieras para crear tu propia composición. Se entregan protegidas, sin armado de ramo ni empaque de regalo.»

## A4. Замена баннера «frescura del viaje»
Было: «Flores que aún conservan la frescura del viaje»
Стало: «Flores que llegan a Chile en días en vez de semanas»
Строка под ним: «Casi todas las flores importadas a Chile llegan por barco, 2–3 semanas. Las nuestras vuelan: llegan frescas y duran más.» — ждёт источника.

## A5. Строка для Софьи
Черновик: «En Santiago casi nadie vende por tallo, salvo el mercado mayorista. Aquí sí: la especie que buscas, por tallo, sin ese viaje.» Ждёт одобрения владельца.

## A6. Порядок секций главной
1. Hero (A1) + строка стойкости и гарантии (A2).
2. Самолёт.
3. «Recién llegadas»: товары с фото, ценой и ссылкой на карточку (A7).
4. «Cómo funciona» (A3).
5. «Por largo de tallo»: 4 категории размеров.
6. «Para cada espacio»: бизнес, офис, дом — 3 колонки на desktop, стопкой на mobile (A8).
7. Баннер про самолёт vs корабль (A4).
8. Выборка отзывов, FAQ, статьи блога (A9).

## A7. Fresh Arrival
Переименовать в «Recién llegadas», если это действительно новые поставки; под заголовком одной строкой правило отбора.
В подборку добавить редкие виды, а не только mini clavel и alstroemeria.

## A8. Блоки «Para cada espacio»
Сжать три длинных блока в три сопоставимые карточки (3 колонки desktop, стопкой mobile).
Карточка «Negocios / Oficinas» ведёт на /empresas (страницы пока нет — ссылку не ставить).
Отзыв Camilia («suscripción de flores en la oficina») перенести с главной на /empresas — позже.

## A9. Отзывы
На главной короткая выборка (3–5 отзывов, в т.ч. Valentina P. и Antonia) + кнопка «Ver todas las opiniones».
Фото отзывов Loox грузить лениво (это блок F).

## Статус пунктов (на 2026-09-28)
Можно сейчас: A1 (заголовок первым + h1, одна главная кнопка), A3, A6, A7, A8 (без ссылки на /empresas), A9.
Ждут ответа заказчика или другого блока — НЕ делать:
- A1 «sin pagar de más» — нет расчёта экономии;
- A1 ссылка «Por especie» — страниц по видам нет (блок B);
- A5 — черновик, владелец не одобрил;
- A8 ссылка на /empresas — страницы нет (блок D).
«Antes de las 17:00 y llega mañana» уже есть в шапке сайта — можно использовать.

Обновление 2026-09-28 (фидбек заказчика, docs/feedback-2026-09-28.md):
- A2 — ОТМЕНЁН целиком: магазин отказывается от гарантии замены, строки стойкости и гарантии не будет.
- A4 — РАЗБЛОКИРОВАН, тексты — п. 10 фидбека (без обещаний стойкости «duran más»).
- Гарантия замены — отменена во всём магазине (FAQ-блок про cambio/reposición на главной удаляется).
- Карточка товара: «Comprar ahora» убираем, delivery-slots убираем (см. docs/task-product-card.md).