import { Dialog } from 'material-ui';
import * as colors from 'material-ui/styles/colors';
import Done from 'material-ui/svg-icons/action/done';
import Clear from 'material-ui/svg-icons/content/clear';
import * as React from 'react';
import * as _ from 'underscore';

import { CoffeeShopModel } from '../types';
import CoffeeShopHours from './CoffeeShopHours';

interface Props {
  isSmallScreen: boolean;
  // Coffee shop to render.
  coffeeShop: CoffeeShopModel;
  // Callback when dialog is closed.
  onCloseDialog: () => void;
}

const renderImages = (photos: string[], isSmallScreen: boolean) =>
  <div style={{display: 'flex', justifyContent: 'space-between'}}>
    {_.map(photos, (photoURL, i) => {
      if (isSmallScreen && i === 0 || !isSmallScreen) {
        return <img key={photoURL} src={photoURL} />
      }
      return null;
    })}
  </div>

const renderCheckmark = (description: string, positive: boolean) =>
  <div className="checkmark">
    {positive ? <Done color={colors.green500} /> : <Clear color={colors.red500} />}
    <div>{description}</div>
  </div>

const formatPhoneNumber = (phoneNumber: string) => `(${phoneNumber.slice(2,5)}) ${phoneNumber.slice(5, 8)}-${phoneNumber.slice(8, 11)}`;

const CoffeeShop = ({isSmallScreen, coffeeShop, onCloseDialog}: Props) =>
  <Dialog
    style={{width: '100%', paddingTop: 0}}
    contentStyle={{maxWidth: '850px'}}
    open={coffeeShop !== null} onRequestClose={onCloseDialog}
  >
    <div className="coffee-shop">
      {coffeeShop.id}
      <div className="header">
        <h2>{coffeeShop.name}</h2>
        <div>{coffeeShop.price}</div>
      </div>
      {renderImages(coffeeShop.photos, isSmallScreen)}
      <div className="info">
        <div className="metadata">
          <div>
            <div>{coffeeShop.location.display_address[0]}</div>
            <div>{coffeeShop.location.display_address[1]}</div>
          </div>
          <div>{formatPhoneNumber(coffeeShop.phone)}</div>
          <div>
            {renderCheckmark('Open now', coffeeShop.hours && coffeeShop.hours[0].is_open_now)}
            {renderCheckmark('Good for studying', coffeeShop.is_good_for_studying)}
          </div>
        </div>
        <CoffeeShopHours hours={coffeeShop.hours && coffeeShop.hours[0].open} />
      </div>
    </div>
  </Dialog>

export default CoffeeShop;
