$(function() {
	
	/**
	*  Photo Model
	*
	**/
	Photo = Backbone.Model.extend({
		defaults: function() {
			return {
				id: null,
				src: null,
				author: null,
				caption: 'caption',
				tags: null,
				category: 'null',
				order: Photos.nextOrder(),
			};
		},
	});
	
	/**
	*  Photo Collection
	*
	**/
	PhotoCollection = Backbone.Collection.extend({
		model: Photo,

		localStorage: new Store("photos"),

		comparator: function(photo) {
			photo.get('order');
		},

		nextOrder: function() {
			if (!this.length) {
				return 1;
			}
			return this.last().get('order') + 1;
		},
		
		allTags: function() {
			tagsArray = [];
			this.each( function(photo) {
				
				tagsArray = tagsArray.concat(photo.get('tags'));
			});
			
			return this.uniqueTags(tagsArray);
		},
		
		uniqueTags: function(origArr) {
			var newArr = [],  
			        origLen = origArr.length,  
			        found,  
			        x, y;  

			    for ( x = 0; x < origLen; x++ ) {  
			        found = undefined;  
			        for ( y = 0; y < newArr.length; y++ ) {  
			            if ( origArr[x] === newArr[y] ) {  
			              found = true;  
			              break;  
			            }  
			        }  
			        if ( !found) newArr.push( origArr[x] );  
			    }  
			   return newArr;
		}
		
	});
	
	Photos = new PhotoCollection;
	
	/**
	*  View for a photo list
	*
	**/
	PhotoView = Backbone.View.extend({
		tagName : 'li',
		className: 'photo-item',
		
		template: _.template($('#photo-template').html()),
		
		events : {
			'click a.remove' : 'clear',
		},
		
		initialize: function() {
			this.model.bind('add', this.render, this);
			this.model.bind('change', this.render, this);
			this.model.bind('destroy', this.remove, this);
		},
		
		render: function() {
			
			$(this.el).html(this.template(this.model.toJSON()));
			this.setPhoto();
			tags = this.getTags();
			$(this.el).addClass(function(){
				return tags.join(" ");
			});			
			return this;
		},
		
		getTags: function(){
			return this.model.get('tags');
		},
		
		setPhoto: function() {
			var photo = this.model.get('photo');
		},
		
		clear: function() {
			this.model.destroy();
			$('#photo-list').isotope('reLayout');
			return false;
		},
	
	});

	
	/**
	*  GalleryView
	*
	**/
	GalleryView = Backbone.View.extend({
		el: $('body'),
		
		countTemplate: _.template($('#count-template').html()),
		tagsTemplate: _.template($('#tags-template').html()),
		
		events: {
			'click .create' : 'createOnClick',
			'click #remove' : 'removePhoto',
			'click #clear-all' : 'removeAll'
		},
		
		initialize: function() {
			Photos.bind('add',	this.addPhoto, this);
			Photos.bind('reset',this.addAll, this);
			Photos.bind('all',	this.render, this);

			Photos.fetch();
			if(Photos.length<1) {
				this.newPhotosPull("8722250@N07", 1);
			}
		},
		
		render: function() {
			this.$('#photo-count').html(this.countTemplate({
				count: Photos.length, 
			}));
			this.$('#photo-tags').html(this.tagsTemplate({
				allTags: Photos.allTags(),
			}));
			
			
			this.addAll();
			window.decorateList();
		    return false;
		},
		
		createOnClick: function(flickrId ) {
		    this.newPhotosPull('24247691@N05');
			$('#photo-list').isotope('reloadItems');
			this.addAll();
		},
		
		addPhoto: function(photo) {
			var view = new PhotoView({model: photo});
				this.$('#photo-list').append(view.render().el);
		},
		
		addAll: function() {
			$('#photo-list').remove();
			$('#gallery-app').html('<ul id="photo-list" style="display:none"></ul>');
			Photos.each(this.addPhoto);
						
		},
		
		removeAll: function() {
			Photos.each( function(photo) {
				photo.destroy();
				
			});
			return false;
		},
		
		removePhoto: function(photo) {
			photo.destroy();
			return false;
		},
		
		newPhotosPull : function(flickrId) {
			// photos populate from flickr
			$.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
				{
		    		id: flickrId,
		    		tagmode: "any",
		    		format: "json"
		  		},
				function(data) {
					$.each(data.items, function(i,item) {
						Photos.create(new Photo({
							src: item.media.m.replace('_m', ""),
							caption: item.title,
							tags: item.tags.split(" "),
							link: item.link,
							author: item.author
						}));
					
					});
				}
			);
		}
		
	});
	

	Gallery = new GalleryView;
	//Gallery = new GalleryView;
});
