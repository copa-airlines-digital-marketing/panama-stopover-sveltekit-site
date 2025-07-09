import { expect, test } from 'vitest'
import { getPublishedTours } from './index'

test('Gets tour data when all parameters are correct', async () => {
  const tour = await getPublishedTours({
    locale:'es',
    category: 'ofertas',
    subCategory: 'tours',
    article: 'tour-de-compras'
  }).catch(e => {console.log('Error', e); return null;})
  expect(tour).toHaveLength(1);
})

test('Gets empty array for tours data when all a parameters is incorrect', async () => {
  const tour = await getPublishedTours({
    locale:'es',
    category: 'oferta',
    subCategory: 'tours',
    article: 'tour-de-compras'
  }).catch(e => {console.log('Error', e); return null;})
  expect(tour).toHaveLength(0);
})