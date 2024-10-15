type HotelPromoTranslation = {
    name: string
    promo_name: string
}

type HotelPromo = {
    main_image: string,
    promo_discount_amount: string | null
    promo_discount_percent: string | null
    translations: HotelPromoTranslation[]
}

type ModuleQueryParams = {
  locale: string,
  maxItems: number,
  highlights: boolean,
  promoOnly: boolean,
  sorts: string[]
  pilar?: string[] | null
}

export {
    HotelPromo,
    ModuleQueryParams
}