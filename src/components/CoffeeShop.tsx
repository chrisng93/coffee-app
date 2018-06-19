import { Dialog } from 'material-ui';
import * as React from 'react';

import { CoffeeShopModel } from '../types';

interface Props {
  // Coffee shop to render.
  coffeeShop: CoffeeShopModel;
  // Callback when dialog is closed.
  onCloseDialog: () => void;
}

const CoffeeShop = ({ coffeeShop, onCloseDialog }: Props) => (
  <Dialog open={coffeeShop !== null} onRequestClose={onCloseDialog}>
    {coffeeShop.id}
    {coffeeShop.name}
  </Dialog>
);

export default CoffeeShop;
