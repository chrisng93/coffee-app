import { CoffeeShopModel } from './types';

const getRequest = <T>(url: string): Promise<T> => {
  return fetch(url)
    .then(response => response.json())
    .catch(err => {
      throw new Error(err);
    });
};

export const getCoffeeShops = async (apiURL: string) => {
  return await getRequest<CoffeeShopModel[]>(`${apiURL}/coffee_shop`);
};

export const getIsochrones = async (
  apiURL: string,
  lat: number,
  lng: number,
  walkingTimeMin: number,
) => {
  return await getRequest<number[][]>(
    `${apiURL}/isochrone?origin=${lat},${lng}&walking_time_min=${walkingTimeMin}`,
  );
};

export const getCoffeeShop = async (apiURL: string, id: number) => {
  return await getRequest<CoffeeShopModel>(`${apiURL}/coffee_shop/${id}`);
};
