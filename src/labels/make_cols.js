var utils = require('../Utils_clust');
var add_col_click_hlight = require('./add_col_click_hlight');
var col_reorder = require('../reorder/col_reorder');
var row_reorder = require('../reorder/row_reorder');
var make_col_tooltips = require('./make_col_tooltips');

module.exports = function(cgm, text_delay) {

  var params = cgm.params;
  var col_container;

  var col_nodes = params.network_data.col_nodes;
  var col_nodes_names = params.network_data.col_nodes_names;

  // offset click group column label
  var x_offset_click = params.viz.x_scale.rangeBand() / 2 + params.viz.border_width;
  // reduce width of rotated rects
  var reduce_rect_width = params.viz.x_scale.rangeBand() * 0.36;


  // make container to pre-position zoomable elements
  if (d3.select(params.root+' .col_container').empty()) {

    col_container = d3.select(params.viz.viz_svg)
      .append('g')
      .attr('class','col_container')
      .attr('transform', 'translate(' + params.viz.clust.margin.left + ',' +
      params.viz.norm_labels.margin.top + ')');

    // white background rect for col labels
    col_container
      .append('rect')
      .attr('fill', params.viz.background_color) //!! prog_colors
      .attr('width', 30 * params.viz.clust.dim.width + 'px')
      .attr('height', params.viz.label_background.col)
      .attr('class', 'white_bars');

    // col labels
    col_container
      .append('g')
      .attr('class','col_label_outer_container')
      // position the outer col label group
      .attr('transform', 'translate(0,' + params.viz.norm_labels.width.col + ')')
      .append('g')
      .attr('class', 'col_zoom_container');

  } else {

    col_container = d3.select(params.root+' .col_container')
      .attr('transform', 'translate(' + params.viz.clust.margin.left + ',' +
      params.viz.norm_labels.margin.top + ')');

    // white background rect for col labels
    col_container
      .select('.white_bars')
      .attr('fill', params.viz.background_color) //!! prog_colors
      .attr('width', 30 * params.viz.clust.dim.width + 'px')
      .attr('height', params.viz.label_background.col);

    // col labels
    col_container.select(params.root+' .col_label_outer_container');

  }

  // add main column label group
  var col_label_obj = d3.select(params.root+' .col_zoom_container')
    .selectAll('.col_label_text')
    .data(col_nodes, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class', 'col_label_text')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(col_nodes_names, d.name);
      return 'translate(' + params.viz.x_scale(inst_index) + ') rotate(-90)';
    });

  // append group for individual column label
  var col_label_group = col_label_obj
    // append new group for rect and label (not white lines)
    .append('g')
    .attr('class', 'col_label_group')
    // rotate column labels
    .attr('transform', 'translate(' + params.viz.x_scale.rangeBand() / 2 + ',' + x_offset_click + ') rotate(45)')
    .on('mouseover', function() {
      d3.select(this).select('text')
        .classed('active',true);
    })
    .on('mouseout', function() {
      d3.select(this).select('text')
        .classed('active',false);
    });

  // append column value bars
  if (utils.has(params.network_data.col_nodes[0], 'value')) {

    col_label_group
      .append('rect')
      .attr('class', 'col_bars')
      .attr('width', function(d) {
        var inst_value = 0;
        if (d.value > 0){
          inst_value = params.labels.bar_scale_col(d.value);
        }
        return inst_value;
      })
      // rotate labels - reduce width if rotating
      .attr('height', params.viz.x_scale.rangeBand() * 0.66)
      .style('fill', function(d) {
        return d.value > 0 ? params.matrix.bar_colors[0] : params.matrix.bar_colors[1];
      })
      .attr('opacity', 0.6);

  }

  // add column label
  col_label_group
    .append('text')
    .attr('x', 0)
    // manually tuned
    .attr('y', params.viz.x_scale.rangeBand() * 0.64)
    .attr('dx', params.viz.border_width)
    .attr('text-anchor', 'start')
    .attr('full_name', function(d) {
      return d.name;
    })
    // original font size
    .style('font-size', params.labels.default_fs_col + 'px')
    .style('cursor','default')
    .text(function(d){ return utils.normal_name(d); })
    // .attr('pointer-events','none')
    .style('opacity',0)
    .transition().delay(text_delay).duration(text_delay)
    .style('opacity',1);

  make_col_tooltips(params);

  // this is interferring with text tooltip
  //////////////////////////////////////////
  // // append rectangle behind text
  // col_label_group
  //   .insert('rect')
  //   .attr('class','.highlight_rect')
  //   .attr('x', 0)
  //   .attr('y', 0)
  //   .attr('width', 10*params.viz.rect_height)
  //   .attr('height', 0.67*params.viz.rect_width)
  //   .style('opacity', 0);

  // add triangle under rotated labels
  col_label_group
    .append('path')
    .style('stroke-width', 0)
    .attr('d', function() {
      // x and y are flipped since its rotated
      var origin_y = -params.viz.border_width;
      var start_x = 0;
      var final_x = params.viz.x_scale.rangeBand() - reduce_rect_width;
      var start_y = -(params.viz.x_scale.rangeBand() - reduce_rect_width +
      params.viz.border_width);
      var final_y = -params.viz.border_width;
      var output_string = 'M ' + origin_y + ',0 L ' + start_y + ',' +
        start_x + ', L ' + final_y + ',' + final_x + ' Z';
      return output_string;
    })
    .attr('fill', '#eee')
    .style('opacity',0)
    .transition().delay(text_delay).duration(text_delay)
    .style('opacity', params.viz.triangle_opacity);

  // add col callback function
  d3.selectAll(params.root+' .col_label_text')
    .on('click',function(d){

      if (typeof params.click_label == 'function'){
        params.click_label(d.name, 'col');
        add_col_click_hlight(params, this, d.ini);
      } else {

        if (params.tile_click_hlight){
          add_col_click_hlight(params, this, d.ini);
        }

      }

    })
    .on('dblclick', function(d) {

      // if (params.dendro_filter.row === false){

        var data_attr = '__data__';
        var col_name = this[data_attr].name;

        if (params.sim_mat){
          col_reorder(cgm, this, col_name);

          var row_selection = d3.selectAll(params.root+' .row_label_group')
            .filter(function(d){
              return d.name == col_name;}
              )[0][0];

          row_reorder(cgm, row_selection, col_name);

        } else {
          col_reorder(cgm, this, col_name);
        }

        if (params.tile_click_hlight){
          add_col_click_hlight(params, this, d.ini);
        }

      // }

    });

};
