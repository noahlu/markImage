$(function(){
    
    var source = $('#template').html();
    var template = Handlebars.compile(source);
    var context = JSON.parse(localStorage['imageList']);
    var html    = template(context);

    $('#container').html(html);
})