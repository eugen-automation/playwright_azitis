

export const productBasicData = {
    name_ro: 'New product with deposit',
    name_en: 'New product with deposit',
    description_ro: '<p>Product description</p>',
    description_en: '<p>Product description</p>',
    special_terms_en: '<p>Special terms</p>',
    special_terms_ro: '<p>Special terms</p>',
    address_ro: 'Address street 91',
    address_en: 'Address street 91',
    county_ro: 'Alba',
    county_en: 'Alba',
    city_ro: 'city',
    city_en: 'city',
    company_id: '93',
    responsible_id: '17',
    category_id: 50,
    is_vat_needed: '1',
    currency_id: 2,
    evaluation_price: '20000',
    rezervation_price: '15000',
    start_price: '10000',
    deposit_payment_deadline: '2',
    balance_payment_deadline: '5',
    inventory_number: '2525',
    has_guarantee: '0',
    guarantee_percentage: 1,
    guarantee_amount: ''
} as const;

export const productGuaranteeData = {
    name_ro: 'New product with guarantee',
    name_en: 'New product with guarantee',
    has_guarantee: '0',
    guarantee_percentage: 1,
    guarantee_amount: '1000'
} as const;

