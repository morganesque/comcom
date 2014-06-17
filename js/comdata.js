var ComData = Backbone.Model.extend({

    fetchImage:function()
    {
        var comedian = this.get('name');
        // var context  = this.get('id');
        $.ajax({
            dataType: "jsonp",
            crossDomain: true,
            data: {
                format:'json',
                q:comedian+" comedian",
                imgtype:"face",
                // imgsz:"icon",
                rsz:1,
                // context:context
            },
            success:_.bind(this.gotImage,this),
            url: 'https://ajax.googleapis.com/ajax/services/search/images?v=1.0',
            jsonp: "callback",
            // jsonpCallback: "gotImage"
        });
    },

    gotImage:function(a,b,c)
    {
        // console.log(a.responseData.results);        
        var url = a.responseData.results[0].url;        
        this.set('image',url);
    },

    getName:function()
    {
        var title = this.get('title');
        var bits = title.split(' '); 
        if (bits[0] == 'Episode') bits.splice(0,1);

        var end = 0;
        for (var i = 0; i < bits.length; i++) {
             if (bits[i].indexOf('(') == 0)
             {
                end = i;        
             }                     
        };    
        
        var name = (end) ? bits.slice(2,end) : bits.slice(2,4);             
        var extras = (end) ? bits.slice(end,bits.length) : [];             

        // console.log([name.join(' '),extras.join(' ')]);        
        var date = new Date(this.get('publishedDate')); 

        var id = bits[2]+''+bits[3];
            id = id.replace('’','');
            id = id.replace('-','');
            id = id.replace('”','');
            id = id.replace('“','');
            id = id.replace('(','');
            id = id.replace(')','');

        var search = bits[2]+'+'+bits[3];

        var blurb = this.get('contentSnippet');

        this.set({
            'name':name.join(' '),
            'number':bits[0],
            'id':id,
            'extras':extras.join(' '),
            'date':date.toString('dS MMM yyyy'),
            'blurb':blurb,
            'search':search,
        });
    },

});