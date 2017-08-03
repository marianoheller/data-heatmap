import React, { Component } from 'react';
import * as d3 from "d3";

import './Heatmap.css';


import dataJson from  '../dataset.json';

const months = [
    "January",
    "Febrary",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]


export default class HeatmapContainer extends Component {

    parseTime( time ) {
        const timeArray = time.split(":");
        return new Date(0,0,0,0,timeArray[0], timeArray[1]);
    }

    loadData() {
        const { baseTemperature, monthlyVariance } = dataJson;
        
        return monthlyVariance;
    }

    render() {
        return (
            <div>
                <Heatmap 
                baseValue={dataJson.baseTemperature} 
                dataset={dataJson.monthlyVariance}
                />
            </div>
        )
    }
}



class Heatmap extends Component {


    constructor(props){
      super(props)
      this.createHeatmap = this.createHeatmap.bind(this)
    }

    componentDidMount() {
            this.createHeatmap()
    }

    componentDidUpdate() {
            this.createHeatmap()
    }

    
    createHeatmap() {
        const node = this.node;
        const { dataset, baseValue } = this.props;

        const opts = {
            width: 500,
            height: 200,
            margin: {
                top: 50,
                right: 0,
                bottom: 100,
                left: 30
            },
            rect: {
                width: 10,
                height: 40,
            }
        }
        
        const svg = d3.select("#heatmapContainer")
                    .append("svg")
                    .attr("width", opts.width + opts.margin.right + opts.margin.left)
                    .attr("height", opts.height + opts.margin.top + opts.margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${opts.margin.left},${opts.margin.top})`);

        const xScale =  d3.scaleLinear()
                        .domain([d3.min(dataset  , (d) => d.year) , d3.max(dataset  , (d) => d.year )])
                        .range([0,opts.width - opts.margin.left - opts.margin.right])

        const yScale =  d3.scaleLinear()
                        .domain([d3.min(dataset  , (d) => d.month) , d3.max(dataset  , (d) => d.month )])
                        .range([0,opts.height - opts.margin.top - opts.margin.bottom])

        const widthScale =  d3.scaleLinear()
                            .domain([d3.min(dataset  , (d) => d.month) , d3.max(dataset  , (d) => d.month )])
                            .range([0,opts.height - opts.margin.top - opts.margin.bottom])

        const colorScale =  d3.scaleLinear()
                            .domain([d3.min(dataset  , (d) => d.variance) , d3.max(dataset  , (d) => d.variance )])
                            .rangeRound([0,255]);

        svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", (d) => {
            return xScale(d.year);
        })
        .attr("y", (d) => {
            return yScale(d.month);
        })
        .attr("height", (d) => {
            return opts.rect.height;
        })
        .attr("width", (d) => {
            return opts.rect.width;
        })
        .attr("stroke", (d) => {
            return `rgba(${colorScale(d.variance)},80,80, 0.9)`;
        })
        .attr("stroke-width", 1)
        .attr("fill", (d) => {
            return `rgba(${colorScale(d.variance)},80,80, 0.5)`;
        })
    }
    
    render() {

        return  (
            <div id="heatmapContainer" >
            </div>
        
        )
    }
}