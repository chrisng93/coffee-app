import { Dialog } from 'material-ui';
import * as React from 'react';
import * as _ from 'underscore';

import { CoffeeShopModel } from '../types';

interface Props {
  isSmallScreen: boolean;
  // Coffee shop to render.
  coffeeShop: CoffeeShopModel;
  // Callback when dialog is closed.
  onCloseDialog: () => void;
}

export default class CoffeeShop extends React.Component<Props, {}> {
  render() {
    const {isSmallScreen, coffeeShop, onCloseDialog} = this.props;
    return (
      <Dialog style={{width: '100%', paddingTop: 0}} contentStyle={{maxWidth: '900px'}} open={coffeeShop !== null} onRequestClose={onCloseDialog}>
        <div className="coffee-shop">
          {coffeeShop.id}
          {coffeeShop.name}
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            {_.map(coffeeShop.photos, (photoURL, i) => {
              if (isSmallScreen && i === 0 || !isSmallScreen) {
                return <img key={photoURL} src={photoURL} />
              }
              return null;
            })}
          </div>
        </div>
      </Dialog>
    );
  }
}
