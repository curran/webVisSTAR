/**
 * This file contains the core of the slide viewer.
 * By Curran Kelleher 11/26/2013
 *
 * Draws from:
 *
 * http://backbonejs.org
 * http://backbonetutorials.com/what-is-a-view/
 * http://net.tutsplus.com/tutorials/javascript-ajax/game-on-backbone-and-ember
 */
$.get('slides.json', function (slides){


  // The model that stores the current slide state.
  var model = new Backbone.Model({
    currentSlide: ''
  });

  // Change the slide that is shown when the model changes.
  model.on('change', function(){
    // Render the slide
    $('#slide').html(getCurrentSlideHTML());

    // Update the outline to show the current slide.
    renderOutline();
  });


  // First, render the outline.
  function renderOutline(){
    var source = $("#outline-template").html(),
        template = Handlebars.compile(source);
    $('#outline').html(template({
      title: slides[0].title,
      slides: slides,
    }));

    // Make the current slide black.
    $('#' + model.get('currentSlide')).addClass('selected');
  };

  // The model for a single slide.
  var Slide = Backbone.Model.extend({
    defaults: {
      content: 'loading content...'
    }
  });

  // Shows a page with the content of a specific note.
  var SlideView = Backbone.View.extend({
    el: '#slide',
    render: function (){
      var data = this.model.toJSON();
      this.$el.html(this.model.get('content'));
    }
  });

  // Sets dynamic page content based on fragment identifiers.
  var Router = Backbone.Router.extend({
    routes: {
      ':name': 'slide',
      '*path': 'default'
    },
    slide: function (name) {
      model.set('currentSlide', name);
    },
    default: function (){
      model.set('currentSlide', 'intro');
    }
  });


  function setUpArrowKeys(router){
    $("body").keydown(function(e) {
      if(e.keyCode == 37) { // left
        router.navigate(getPrevious(), {trigger: true});
      }
      else if(e.keyCode == 39) { // right
        router.navigate(getNext(), {trigger: true});
      }
    });
  }
  function getNext(){
    var i = getCurrentSlideIndex();
    i = (i + 1) % slides.length;
    return slides[i].name;
  }
  function getPrevious(){
    var i = getCurrentSlideIndex();
    i = (i - 1 + slides.length) % slides.length;
    return slides[i].name;
  }
  function getCurrentSlideIndex() {
    var i, name = model.get('currentSlide');
    for(i = 0; i < slides.length; i++) {
      if(slides[i].name === name){
        return i;
      }
    }
    return -1;
  }
  function getCurrentSlideHTML() {
    var i = getCurrentSlideIndex();
    return slides[i].html;
  }

  // Load all the slide content files.
  async.each(slides, function (slide, callback){
    // Fetch the Markdown (.md) file that contains the content of each slide.
    $.get('slides/' + slide.name + '.md', function (data) {
      // Parse the Markdown into HTML and store it.
      slide.html = marked(data);
      callback();
    });
  }, function (err) {
    // Kick off the page.
    var router = new Router();
    Backbone.history.start();
    setUpArrowKeys(router);
  });
});
