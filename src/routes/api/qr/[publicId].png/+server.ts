import type { RequestHandler } from './$types';
import { qrImage } from '../_image';
export const GET: RequestHandler = (event) => qrImage(event, 'png');
