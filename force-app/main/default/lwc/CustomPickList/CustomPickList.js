/**
 *This class is used to create a custom lookup component
 * @author Sri Ram Kumar
 * @date 25-07-2022
 * @extends LightningElement
 * @hideconstructor
 *
 * @example
 * <c-custom-pick-list class="slds-form-element__control slds-input-has-icon slds-input-has-icon_right" options={Options} selected-value={value} label="Label Name" field-name="Name" multi-select="true if need to select multiple value"
                                onselect={handleSelect}></c-custom-pick-list>
    * update options and values from parent Js.
   * this.template.querySelector("c-custom-pick-list").initDropdownValues(options, singleValue, ListOfValues);
 */

import { LightningElement, track, api } from 'lwc';

export default class CustomPickList extends LightningElement {
    
    @api options;
    @api selectedValue;
    @api selectedValues = [];
    @api label;
    @api minChar = 2;
    @api disabled = false;
    @api multiSelect = false;
    @api fieldName;
    @api required;
    @track value;
    @track values = [];
    @track optionData;
    @track searchString;
    @track message;
    @track showDropdown = false;
    valuesLength = 0;

   /**
    * The function is called when the element is inserted into the DOM
    */
    connectedCallback() {
        this.initDropdownValues(this.options, this.selectedValue, this.selectedValues);
    }
	
	/**
     * This function is used to initialize the dropdown values
     * @param listOptions - This is the list of options that you want to show in the dropdown.
     * @param strSelectedValue - This is the value of the selected option.
     * @param listSelectdValues - This is the list of selected values.
     */
    @api initDropdownValues(listOptions, strSelectedValue, listSelectdValues){
		this.showDropdown = false;
		var optionData = listOptions ? (JSON.parse(JSON.stringify(listOptions))) : null;  
		var value = strSelectedValue ? (JSON.parse(JSON.stringify(strSelectedValue))) : null;
		var values = listSelectdValues ? (JSON.parse(JSON.stringify(listSelectdValues))) : null;
		console.log('value...'+value);
		if(value || values) {
            var searchString;
        	var count = 0;
            for(var i = 0; i < optionData.length; i++) {
                if(this.multiSelect) {
                    if(values.includes(optionData[i].value)) {
                        optionData[i].selected = true;
                        count++;
                    }  
                } else {
                    if(optionData[i].value == value) {
                        searchString = optionData[i].label;
                    }
                }
            }
            if(this.multiSelect){
                this.searchString = count + ' Option(s) Selected';
			}
            else{
                this.searchString = searchString;
			}
			
			console.log('this.searchString...'+this.searchString);
        }
		else{
			if(this.multiSelect){
                this.searchString = '0 Option(s) Selected';
			}
            else{
                this.searchString = value;
			}
		}
        this.value = value;
        this.values = values;
        this.optionData = optionData;
	}

    /**
     * It filters the options based on the search string and shows the filtered options in the dropdown
     * @param event - The event object that is passed to the function.
     */
    filterOptions(event) {
        this.searchString = event.target.value;
        if( this.searchString && this.searchString.length > 0 ) {
            this.message = '';
            if(this.searchString.length >= this.minChar) {
                var flag = true;
                for(var i = 0; i < this.optionData.length; i++) {
                    if(this.optionData[i].label.toLowerCase().trim().startsWith(this.searchString.toLowerCase().trim())) {
                        this.optionData[i].isVisible = true;
                        flag = false;
                    } else {
                        this.optionData[i].isVisible = false;
                    }
                }
                if(flag) {
                    this.message = "No results found for '" + this.searchString + "'";
                }
            }
            this.showDropdown = true;
        } else {
            this.showDropdown = false;
        }
	}

    /**
     * It takes the selected value, checks if it's already selected, and if it is, it removes it from
     * the selected values array. If it's not, it adds it to the selected values array
     * @param event - The event object that is passed to the function.
     */
    selectItem(event) {
        var selectedVal = event.currentTarget.dataset.id;
        if(selectedVal) {
            var count = 0;
            var options = JSON.parse(JSON.stringify(this.optionData));
            for(var i = 0; i < options.length; i++) {
                if(options[i].value === selectedVal) {
                    if(this.multiSelect) {
                        if(this.values.includes(options[i].value)) {
                            this.values.splice(this.values.indexOf(options[i].value), 1);
                        } else {
                            this.values.push(options[i].value);
                        }
                        options[i].selected = options[i].selected ? false : true;   
                    } else {
                        this.value = options[i].value;
                        this.searchString = options[i].label;
                    }
                }
                if(options[i].selected) {
                    count++;
                }
            }
            this.optionData = options;
            if(this.multiSelect)
                this.searchString = count + ' Option(s) Selected';
            if(this.multiSelect)
                event.preventDefault();
            else
                this.showDropdown = false;
        }
    }

   /**
    * If the dropdown is not disabled and there are options, then set the message to an empty string,
    * set the search string to an empty string, make a copy of the option data, set all options to
    * visible, and if there are options, show the dropdown
    */
   /**
    * If the dropdown is not disabled and there are options, then show the dropdown
    */
    showOptions() {
        if(this.disabled == false && this.options) {
            this.message = '';
            this.searchString = '';
            var options = JSON.parse(JSON.stringify(this.optionData));
            for(var i = 0; i < options.length; i++) {
                options[i].isVisible = true;
            }
            if(options.length > 0) {
                this.showDropdown = true;
            }
            this.optionData = options;
        }
	}

   /**
    * It removes the pill from the list of selected options
    * @param event - The event that triggered the function.
    */
    removePill(event) {
        var value = event.currentTarget.name;
        var count = 0;
        var options = JSON.parse(JSON.stringify(this.optionData));
        for(var i = 0; i < options.length; i++) {
            if(options[i].value === value) {
                options[i].selected = false;
                this.values.splice(this.values.indexOf(options[i].value), 1);
            }
            if(options[i].selected) {
                count++;
            }
        }
        this.optionData = options;
        if(this.multiSelect)
            this.searchString = count + ' Option(s) Selected';
        this.onChange();
    }

   /**
    * If the dropdown is open, and the user clicks outside of the dropdown, then the dropdown will
    * close
    */
    blurEvent() {
        if (this.showDropdown === true) {
            var previousLabel;
            var count = 0;
            for (var i = 0; i < this.optionData.length; i++) {
                if (this.optionData[i].value === this.value) {
                    previousLabel = this.optionData[i].label;
                }
                if (this.optionData[i].selected) {
                    count++;
                }
            }
            if (this.multiSelect) {
                this.searchString = count + ' Option(s) Selected';
            } else {
                this.searchString = previousLabel;
            }
            this.showDropdown = false;
            if (this.valuesLength !== this.values.length) {
                this.onChange();
            }
        }
    }

   /**
    * The function focusEvent() is called when the input field is focused. It sets the valuesLength
    * variable to the length of the values array
    */
    focusEvent() {
        this.valuesLength = this.values.length;
    }

   /**
    * A function that is called when the user selects a value from the dropdown.
    */
    onChange() {
        console.log('multiselect size : '+this.values.length);
        this.dispatchEvent(new CustomEvent('select', {
            detail: {
                'payloadType': 'custom-select',
                'fieldName': this.fieldName,
                'payload': {
                    'value': this.value,
                    'values': this.values
                }
            }
        }));
    }
}