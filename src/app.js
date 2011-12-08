$(function() {
	Number = Backbone.Model.extend({
		defaults: function() {
			return {
				// represent the numbers as a string - JS doesn't have the precision to handle really big numbers. :(
				number: '0',
				words: '',
				order: 0,
			};
		},

		initialize: function() {
			words = this.toWords();
			this.set({words: words});
		},

		toWords: function() {
			var number = this.get('number');
			// let's make sure we are working on numbers
			if(isNaN(parseInt(number))) {
				console.log('Nice try, but I don\'t think \'' + number + '\' is a valid number');
				return 1;
			}
			// check for negative
			var negative = false;
			if(parseInt(number) < 0) {
				negative = 'true';
				number = number.replace("-","");
				console.log(number);
			}
			numberGroups = this.getNumberGroups(number);
			words = "";
			// is negative?
			if(negative == 'true') {
				words += 'Negative ';
			}
			words += this.groupsToWords(numberGroups);
			return words;			
		},
		
		groupsToWords: function(numberGroups) {
			// set some important vars
			var smallNumber = new Array("Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen");
			var tensNumber = new Array("", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety");
			var scaleNumber = new Array("", "Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion", "Sextillion", "Septillion", "Octillian", "Nonillion", "Decillion");
			text = "";
			for($i=0; $i<numberGroups.length; $i++) {
				hundreds = '', tens = '', ones = '', tensUnits = '';
				if($i>0) { text += " "; }
				group = parseInt(numberGroups[$i]);
				hundreds = parseInt(group / 100);
				tens = parseInt(group % 100);
				if(hundreds != 0) {
					text += smallNumber[hundreds] + " Hundred ";
					if(tens != 0) {
						text += "and ";
					}
				}
				if(tens<20) {
					text += smallNumber[tens] + " ";
				} else {
					tensUnits = parseInt(tens / 10);
					ones = tens % 10;
					if(tensUnits != 0) {
						text += tensNumber[tensUnits] + " ";
					}
					if(ones != 0) {
						text += smallNumber[ones] + " ";
					}
				}
				// apply scale number
				text += scaleNumber[numberGroups.length - ($i + 1)];
			}
			return text;
		},

		getNumberGroups : function(number) {
			reversed = this.reverseString(number);
			numberGroups = [];
			for($i = 0; $i < reversed.length; $i++) {
				pos = $i * 3
				digits = this.reverseString(reversed.substring(pos, pos+3));
				if(digits) {
					numberGroups.push(digits);
				}
			}
			return numberGroups.reverse()
		},
		
		reverseString: function(s) {
			return s.split("").reverse().join("");
		}
			
	});
	
	NumberCollection = Backbone.Collection.extend ({
		model: Number,
		localStorage: new Store("number"),

		comparator: function(number) {
			number.get('order');
		},

		nextOrder: function() {
			if (!this.length) {
				return 1;
			}
			return this.last().get('order') + 1;
		},
		
	});
	Numbers = new NumberCollection;
	defaultNumber = new Number({number:'1234'});
	Numbers.add(defaultNumber);
	
	NumberView = Backbone.View.extend({
		tagName: "li",
		template: _.template($('#number-template').html()),
		events: {
			"keypress .number-input" : "updateOnEnter",
			"click span.number-destroy"   : "clear",
		},
		initialize: function() {
			this.model.bind('change', this.render(), this);
			this.model.bind('destroy', this.remove, this);
		},
		render: function() {
			console.log(this.model);
			$(this.el).html(this.template(this.model.toJSON()));
//			this.setText();
			return this;
		},
		
		updateOnEnter: function(e) {
			if(e.keyCoke == 13) this.close();
		},
		
		// Remove this view from the DOM.
		    remove: function() {
		      $(this.el).remove();
		    },

		    // Remove the item, destroy the model.
		    clear: function() {
		      this.model.destroy();
		}
		
	});
	
	AppView = Backbone.View.extend({
		el: $('#numberapp'),
		events: {
			"keypress #new-number": "createOnEnter",
		},
		initialize: function() {
			this.input = this.$("#new-number");
			Numbers.bind('add', this.addOne, this);
			Numbers.bind('reset', this.addAll, this);
			Numbers.bind('all', this.render, this);
			Numbers.fetch();
		},
		render: function() {
			//
			//this.addAll();
		},
		addOne: function(number) {
			var view = new NumberView({model: number});
			this.$("#number-list").append(view.render().el);
		},
		addAll: function() {
			Numbers.each(this.addOne);
		},
		createOnEnter: function(e) {
			var text = this.input.val();
			if(!text || e.keyCode != 13) { return; }
			number = Numbers.create({number: text});
			this.input.val('');
		},
	});
	
	
	App = new AppView
	
});