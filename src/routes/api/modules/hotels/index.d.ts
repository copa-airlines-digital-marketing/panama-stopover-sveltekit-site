type HotelPromoTranslation = {
    name: string
}

type HotelPromo = {
    main_image: string,
    promo_discount_amount: string | null
    promo_discount_percent: string | null
    translations: HotelPromoTranslation[]
}

export {
    HotelPromo
}