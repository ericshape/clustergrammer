// slider script - col
$(function() {

  var d3c = d3_clustergram();

  // load network
  d3.json('json/example_network.json', function(network_data){

    // define the outer margins of the visualization
    var outer_margins = {
        'top':5,
        'bottom':33,
        'left':225,
        'right':2
      };

    // define callback function for clicking on tile
    function click_tile_callback(tile_info){
      console.log('my callback')
      console.log('clicking on ' + tile_info.row + ' row and ' + tile_info.col + ' col with value ' + String(tile_info.value))
    };

    // define callback function for clicking on group
    function click_group_callback(group_info){
      console.log('running user defined click group callback')
      console.log(group_info.type);
      console.log(group_info.nodes);
      console.log(group_info.info);
    };

    // define arguments object
    var arguments_obj = {
      'network_data': network_data,
      'svg_div_id': 'svg_div',
      'row_label':'Row-Data-Name',
      'col_label':'Column-Data-Name',
      'outer_margins': outer_margins,
      // 'opacity_scale':'log',
      // 'input_domain':7,
      'col_overflow':1
      // 'transpose':true,
      // 'zoom':false,
      // 'tile_colors':['#ED9124','#1C86EE'],
      // 'background_color':'orange',
      // 'title_tile': true,
      // 'click_tile': click_tile_callback,
      // 'click_group': click_group_callback
      // 'resize':false
      // 'order':'rank'
    };

    // make clustergram: pass network_data and the div name where the svg should be made
    d3c.make( arguments_obj );
  });

  $( "#slider_col" ).slider({
    value:0.5,
    min: 0,
    max: 1,
    step: 0.1,
    slide: function( event, ui ) {

      // get inst_index from slider
      $( "#amount" ).val( "$" + ui.value );
      var inst_index = ui.value*10;

      // change group sizes
      d3c.colorbar_groups('col',inst_index)

    }
  });

  $( "#amount" ).val( "$" + $( "#slider_col" ).slider( "value" ) );

  $( "#slider_row" ).slider({
    value:0.5,
    min: 0,
    max: 1,
    step: 0.1,
    slide: function( event, ui ) {
      $( "#amount" ).val( "$" + ui.value );
      var inst_index = ui.value*10;

      // change group sizes
      d3c.colorbar_groups('row',inst_index)
    }
  });
  $( "#amount" ).val( "$" + $( "#slider_row" ).slider( "value" ) );

  // submit genes button
  $('#gene_search_box').keyup(function(e) {
    if (e.keyCode === 13) {
      var search_gene = $('#gene_search_box').val();
      d3c.find_row(search_gene);
    }
  });

  $('#toggle_order .btn').click(function(evt) {
    var order_id = $(evt.target).find('input').attr('id').replace('_button', '');
    d3c.reorder(order_id);
  });
});