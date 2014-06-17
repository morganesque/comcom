var Comedian = Backbone.View.extend(
{        
    events:{
        'click .info': 'onItemClick',
    },

    attributes:{
        'class':'item'
    },

    initialize: function(options) 
    {
        this.listenTo(this.model, "change", this.render)
    },  
    
    render: function()
    {
        this.$el.empty();

        var html = template(this.model.attributes);
        this.$el.append(html);
        this.$el.find('.blurb').hide();

        if (this.model.changed.hide)
        {
            this.$el.hide();
        } else {
            this.$el.show().css('display','inline-block');
        }

        var search = this.model.get('search');
        this.$el.find('.youtube').attr('href','https://www.youtube.com/results?search_query='+search+'+comedian');
    },

    onItemClick:function(e)
    {
        e.preventDefault();

        if (this.$el.hasClass('blurb'))
        {
            this.$el.find('.front').css({opacity:1});
            this.$el.find('.blurb').hide();
        } else {
            
            this.$el.find('.front').css({opacity:0});
            this.$el.find('.blurb').show();
        }
        this.$el.toggleClass('blurb')
    },
});