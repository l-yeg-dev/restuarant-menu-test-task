<template>
  <div class="order container-fluid">
    <div class="order__wrapper row">
          <div class="col-md-6 offset-md-3">
            <div class="text-dark d-flex justify-content-center mb-5">
              <Logo />
            </div>
            <Multiselect
                v-model="order"
                mode="tags"
                placeholder=""
                label="name"
                track-by="name"
                searchable
                :close-on-select="false"
                :search="true"
                :options="options"
                :object="true"
                :clearOnSelect="false"
                :hide-selected="selectingIngredient"
                :canClear="true"
                :allow-absent="true"
                @select="handleSelect"
                @clear="resetOptions"
            >
              <template v-slot:tag="{ option, disabled }">
                <div class="multiselect-tag is-user px-1">
                  {{ option.name }}
                  <span
                      v-if="!disabled"
                      class="multiselect-tag-remove"
                      @mousedown.prevent="handleTagRemove({...option})"
                  >
                    <span class="multiselect-tag-remove-icon"></span>
                  </span>
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
import {getMenu} from "../../services/menuService";
import {v4 as uuidv4} from 'uuid';

const menuItemsBase = [
  {value: uuidv4(), name: "Menu-item"},
  {value: uuidv4(), name: "Ingredient"},
  {value: uuidv4(), name: "AND"},
  {value: uuidv4(), name: "Receipt"},
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
      this.menu = Object.keys(data['Menu-Item']).map(menuItem => {
        const id = uuidv4();
        this.ingredients[id] = data.Ingredient[menuItem].map(ingredient => ({value: uuidv4(), name: ingredient, parentId: id}))
        return {
          value: id,
          id,
          name: menuItem,
        }
      });
    })
  },
  data () {
    return {
      actionMenu: [],
      selectedAction: null,
      selectedDish: null,
      order: [],
      menu:[],
      ingredients: {},
      selectedIngredients: [],
      isActionSelected: false,
      isDishSelected: false,
      isReceiptShown: false,
      priceList: null,
      receipt: []
    }
  },
  computed:{
    options() {
      if (!this.order.length) {
        return [menuItemsBase[0]];
      }
      if (this.selectingAction) {
        return this.actionMenu.map(action => ({...action}));
      }
      if (this.selectingDish){
        return this.menu.map(menu => {
          menu.value = uuidv4();
          return {...menu};
        });
      }
      if (this.selectingIngredient) {
        return this.ingredients[this.selectedDish.id].map(ingredient => {
          const isDisabled = !!this.selectedIngredients.find(item => ingredient.name === item.name.split("I/").pop())
          ingredient.value = uuidv4();
          return {...ingredient, disabled: isDisabled};
        });
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
  },
  methods:{
    handleSelect(option) {
      if (option.value === menuItemsBase[3].value){
        this.handleReceiptAction();
        return;
      }

      if (option.value === menuItemsBase[2].value) {
        this.handleAndAction();
        return;
      }

      if (this.selectingAction){
        this.handleActionSelect(option);
        return;
      }

      if (this.selectingDish) {
        this.selectedIngredients = [];
        this.handleSelectingDish(option)
        return;
      }

      if (this.selectingIngredient) {
        this.handleSelectingIngredient(option);
      }
    },
    handleReceiptAction() {
      this.showReceipt();
      this.isDishSelected = true;
      this.isReceiptShown = true;
      this.removeFromOrder(menuItemsBase[3]);
    },
    handleAndAction() {
      if (!this.selectingAction) {
        this.isActionSelected = true;
        this.isDishSelected = true;

        return;
      }
      this.actionMenu = [menuItemsBase[0], menuItemsBase[1]];
    },

    handleActionSelect(option) {

      this.isActionSelected = true;

      if (option.value === menuItemsBase[1].value) {
        this.isDishSelected = true;
      }

    },

    handleSelectingDish(option) {
      this.removeFromOrder(menuItemsBase[0]);
      this.order.at(-1).name = 'M/' +option.name;
      this.isDishSelected = true;
      this.selectedDish = option;
    },

    handleSelectingIngredient(option) {
      this.removeFromOrder(menuItemsBase[0]);
      this.removeFromOrder(menuItemsBase[1]);
      this.order.at(-1).name = 'I/'+option.name;
      menuItemsBase[2].value = uuidv4();
      menuItemsBase[3].value = uuidv4();
      this.actionMenu = [menuItemsBase[2], menuItemsBase[3]]
      this.actionMenu = this.actionMenu.filter(menuItem => (
          menuItem.value !== menuItemsBase[0].value && menuItem.value !== menuItemsBase[1].value
      ));
      this.isActionSelected = false;
      this.isDishSelected = false;
      this.selectedIngredients.push(option);
    },

    handleTagRemove(option) {
      if (option?.name === menuItemsBase[2].name || option.id) {

        let canDelete = false;
        let deletingFor = null;
        if (option.id) {
          deletingFor = option;
        }

        this.order.forEach(orderItem => {
          if (orderItem.value === option.value) {
            canDelete = true;
          }

          if (option.id) {
            if (orderItem.id && orderItem.value !== deletingFor.value) {
              canDelete = false;
            }
          } else {
            if (canDelete === true && orderItem.name === menuItemsBase[2].name && orderItem.value !== option.value) {
              canDelete = false;
            }
          }

          if (canDelete && orderItem.value !== option.value) {
            this.removeFromOrder(orderItem);
          }
        });
      }
      this.removeFromOrder(option);


        this.resetOptions();

      if (!this.order.length) {
        this.resetOptions();
      }
    },

    resetOptions() {
      this.isDishSelected=false;
      this.isActionSelected = false
    },

    showReceipt() {
      let billItems = {};
      let total = 0;
      this.order.forEach(orderItem => {
        if (orderItem.name.includes('M/')) {
          const orderItemName = orderItem.name.split("M/").pop();
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
      this.receipt = Object.keys(billItems).map(billItem => ({
        name: `${billItem} - ${billItems[billItem]}NIS`,
        disabled: true
      }));
      this.receipt.unshift({name:"Order:", disabled: true});
    },
    removeFromOrder(item) {
      this.order = this.order.filter(orderItem => (orderItem.value !== item.value ));
    }
  },
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
