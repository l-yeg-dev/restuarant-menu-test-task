<template>
  <div class="order container-fluid">
    <div class="order__wrapper row">
          <div class="col-6 offset-3">
            <div class="text-dark d-flex justify-content-center mb-5">
              <Logo />
            </div>
            <Multiselect
                v-model="order"
                mode="tags"
                placeholder="Select employees"
                label="name"
                :close-on-select="false"
                :search="true"
                :options="options"
                @select="handleSelect"
                :clearOnSelect="false"
                :hide-selected="false"
                :canClear="false"
                :allowAbsent="true"
                searchable
            >
              <template v-slot:tag="{ option, handleTagRemove, disabled }">
                <div class="multiselect-tag is-user px-1">
                  {{ option.name }}
                </div>
              </template>

              <template v-slot:option="{ option }">
                 {{ option.name }}
              </template>
            </Multiselect>
          </div>
        </div>
      </div>
</template>

<script>

import Logo from "../Logo/Logo.vue";
import Multiselect from "@vueform/multiselect";
import { getMenu } from "../../services/menuService";

const menuItemsBase = [
  "Menu-item",
  "Ingredient",
  "AND",
  "Receipt"
]

export default {
  name: 'Order',
  components: {
    Logo,
    Multiselect
  },
  created() {
    getMenu().then(data => {
      if (!data['Menu-Item']) {
        console.log('No Items found');
        return;
      }

      this.priceList = data['Menu-Item'];
      this.menu = Object.keys(data['Menu-Item']).map(item => item);
      this.ingredients = data.Ingredient;
    })
  },
  data () {
    return {
      initialMenu: [menuItemsBase[0]],
      selectedAction: null,
      selectedDish: null,
      order: [],
      menu:[],
      ingredients: {},
      isActionSelected: false,
      isDishSelected: false,
      isReceiptShown: false,
      priceList: null,
      receipt: []
    }
  },
  computed:{
    options() {
      if (this.selectingAction) {
        return this.initialMenu;
      }
      if (this.selectingDish){
        return this.menu;
      }
      if (this.selectingIngredient) {
        return this.ingredients[this.selectedDish];
      }
      if (this.showingReceipt) {
        return this.receipt;
      }
    },

    selectingAction() {
      return !this.isActionSelected && !this.isDishSelected;
    },
    selectingDish() {
      return this.isActionSelected && !this.isDishSelected;
    },
    selectingIngredient() {
      return this.isActionSelected && this.isDishSelected;
    },
    showingReceipt() {
      return this.isReceiptShown;
    },
    canSeeReceipt() {
      return !!this.initialMenu.find(item=> item === menuItemsBase[3])
    },
    canSeeAnd() {
      return !!this.initialMenu.find(item=> item === menuItemsBase[2])
    }
  },
  methods:{
    handleSelect(item) {
      console.log('selectedItem', item);

      debugger
      if (item === menuItemsBase[3]){
        this.showReceipt();
        this.isDishSelected = true;
        this.isReceiptShown = true;
        return;
      }

      if (item === menuItemsBase[2]) {
        const lowerCasedAnd = menuItemsBase[2].toLowerCase()
        this.order = this.order.map(orderItem => orderItem === item ? lowerCasedAnd : orderItem)
        if (!this.selectingAction) {
          this.isActionSelected = true;
          this.isDishSelected = true;

          return;
        }
        this.initialMenu = [menuItemsBase[0], menuItemsBase[1]]

        return;
      }

      if (this.selectingAction){
        if (item === menuItemsBase[1]) {
          this.removeFromOrder(item)
          this.isActionSelected = true;
          this.isDishSelected = true;

          return;
        }
        this.isActionSelected = true;

        return;
      }

      if (this.selectingDish) {
        const orderDish = 'M/' + item;
        this.removeFromOrder(item, this.initialMenu[0])
        this.order.push(orderDish);
        this.isDishSelected = true;
        this.selectedDish = item;

        return;
      }

      if (this.selectingIngredient) {
        const orderIngredient = 'I/' + item;
        this.removeFromOrder(item, this.initialMenu[0])
        this.order.push(orderIngredient);
        if (!this.canSeeReceipt) {
          this.initialMenu.push('Receipt');
        }
        this.initialMenu = this.initialMenu.filter(menuItem => (menuItem !== menuItemsBase[0] && menuItem !== menuItemsBase[1]))
        if (!this.canSeeAnd){
          this.initialMenu.unshift(menuItemsBase[2])
        }
        this.isActionSelected = false;
        this.isDishSelected = false;

      }
    },
    showReceipt() {
      let billItems = {};
      let total = 0;
      this.order.forEach(orderItem => {
        if (orderItem.includes('M/')) {
          const orderItemName = orderItem.split("M/").pop();
          const orderItemPrice = this.priceList[orderItemName];
          if(!billItems[orderItemName]) {
            billItems[orderItemName] = orderItemPrice;
          } else {
            billItems[orderItemName] += orderItemPrice;
          }
          total += orderItemPrice;
        }
      });
      billItems.Total = total;
      this.receipt = Object.keys(billItems).map(billItem => `${billItem} - ${billItems[billItem]}NIS`);
      this.receipt.unshift("Order:");
    },
    removeFromOrder(item, itemType = null) {
      this.order = this.order.filter(orderItem => (orderItem !== item && orderItem !== itemType))
    }
  }
}
</script>
<style src="@vueform/multiselect/themes/default.css"></style>

<style lang="scss">
  $content-height: calc(100vh - 64px);
  .order{
    min-height: $content-height;
    background-image: url('/src/assets/background.png');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;

    &__wrapper {
      padding-top: 10%;
      min-height: $content-height;
      background-color: #FFFFFFB8;
    }
    .show-options-on-receipt {
      .multiselect-dropdown{
        display: block;
      }
    }
  }
</style>
