import React, { Component } from 'react';
import * as d3 from "d3";
import d3tip from "d3-tip";

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
        const { monthlyVariance } = dataJson;
        
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
        const { dataset, baseValue } = this.props;

        const opts = {
            width: 1000,
            height: 500,
            margin: {
                top: 50,
                right: 0,
                bottom: 50,
                left: 50
            },
            colors: {
                domain: [
                            baseValue + d3.min(dataset  , (d) => d.variance) , 
                            baseValue,
                            baseValue + d3.max(dataset  , (d) => d.variance )
                ],
                range: ["#0000CC", "#f7ff89", "#ba0000"],
            },
        }
        
        const svg = d3.select("#heatmapContainer")
                    .append("svg")
                    .attr("width", opts.width + opts.margin.right + opts.margin.left)
                    .attr("height", opts.height + opts.margin.top + opts.margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${opts.margin.left},${opts.margin.top})`);

        const heightSquare = ( (opts.height - opts.margin.top - opts.margin.bottom) / 12 );
        const widthSquare = ( (opts.width - opts.margin.left - opts.margin.right) / (dataset.length / 12) );

        const xScale =  d3.scaleTime()
                        .domain([
                            new Date(d3.min(dataset  , (d) => d.year), 0 ) , 
                            new Date(d3.max(dataset  , (d) => d.year)+1, 11 )
                        ])
                        .range([0, (opts.width - opts.margin.left - opts.margin.right)-widthSquare]);

        const yScale =  d3.scaleLinear()
                        .domain([d3.min(dataset  , (d) => d.month) , d3.max(dataset  , (d) => d.month )])
                        .range([0,(opts.height - opts.margin.top - opts.margin.bottom)- heightSquare])

        const colorScale =  d3.scaleLinear()
                            .domain( opts.colors.domain )
                            .range( opts.colors.range );

        const xAxis =   d3.axisBottom(xScale).tickArguments([d3.timeYear.every(10)]);

        const yAxis = d3.axisLeft(yScale);

        const tip =  d3tip()
                    .attr('class', 'd3-tip')
                    .html( (d) =>  {
                        return `
                        <strong>Year:</strong> ${d.year}<br>
                        <strong>Month:</strong> ${d.month}<br>
                        <strong>Temperature:</strong> ${Math.round( (baseValue + d.variance) * 100) / 100}
                         
                        `;
                    }); 
        svg.call(tip);

        svg.append("text")
        .attr("x", (opts.width / 2))             
        .attr("y", 0 - (opts.margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text("Monthly Global Land-Surface Temperature");

        svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", (d) => {
            return xScale( new Date(d.year, d.month-1));
        })
        .attr("y", (d) => {
            return yScale(d.month);
        })
        .attr("height", (d) => {
            return heightSquare;
        })
        .attr("width", (d) => {
            return widthSquare;
        })
        .attr("stroke", (d) => colorScale( baseValue + d.variance ))
        .attr("stroke-width", 1)
        .attr("fill", (d) => colorScale( baseValue + d.variance ))
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

        svg.append("g")
        .attr("transform", `translate(0, ${opts.height - opts.margin.top - opts.margin.bottom})`)
        .call(xAxis);

        svg.append("g")
        .selectAll("text")
        .data(months)
        .enter()
        .append("text")
        .style("text-anchor", "end")
        .attr("class", "axis-label")
        .attr("x", 0)
        .attr("y", (d, i) => {
            const heightSquare = ( (opts.height - opts.margin.top - opts.margin.bottom ) / 12 );
            return heightSquare*(i) + heightSquare/2;   
        })
        .attr("transform", `translate(${-4}, 0)`)
        .text( (m) => {
            return m.split("").filter( (e,i) => i < 3).join("") + ".";
        });
/* 
        svg.append("g")
        .selectAll("rect")
        .data(opts.colors.range)
        .enter()
        .append("rect")
        .attr("fill", (d) => d)
        .attr("x", (d,i) => {
            return opts.width - opts.margin.left -   (i+1)*40;
        } )
        .attr("y", (d,i) => {
            return opts.height - 20;
        })
        .attr("width", 50)
        .attr("height", 50)
 */

        const legend = svg.append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%")
        .attr("spreadMethod", "pad");

        legend.selectAll("stop")
        .data(opts.colors.range)
        .enter()
        .append("stop")
        .attr("offset", (d,i) => {
            const cantColors = opts.colors.range.length;
            const step = Math.round(100*100/cantColors)/100;
            return `${step*(i+1)}%`
        })
        .attr("stop-color", (d) => d)
        .attr("stop-opacity", 1);

        svg.append("rect")
        .attr("width", 200)
        .attr("height", 200)
        .attr("x", opts.width - opts.margin.left )
        .attr("y", opts.height - 20)
        .style("fill", "url(#gradient)");

    }
    
    render() {

        return  (
            <div id="heatmapContainer" >
            </div>
        
        )
    }
}