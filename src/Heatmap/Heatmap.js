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
                top: 70,
                right: 0,
                bottom: 80,
                left: 80
            },
            colors: {
                domain: [
                            baseValue + d3.min(dataset  , (d) => d.variance) , 
                            baseValue,
                            baseValue + d3.max(dataset  , (d) => d.variance )
                ],
                range: ["#0000CC", "#f7ff89", "#ba0000"],
            },
            legend: {
                width: 300,
                height: 15
            }
        }
        
        const svg = d3.select("#heatmapContainer")
                    .append("svg")
                    .attr("width", opts.width + opts.margin.right + opts.margin.left)
                    .attr("height", opts.height + opts.margin.top + opts.margin.bottom);

        const heightSquare = ( opts.height / 12 );
        const widthSquare = ( opts.width / (dataset.length / 12) );

        //SCALES
        const xScale =  d3.scaleTime()
                        .domain([
                            new Date(d3.min(dataset  , (d) => d.year), 0 ) , 
                            new Date(d3.max(dataset  , (d) => d.year), 11)
                        ])
                        .range([0, opts.width]);

        const yScale =  d3.scaleLinear()
                        .domain([d3.min(dataset  , (d) => d.month) , d3.max(dataset  , (d) => d.month )])
                        //.range([0,(opts.height - opts.margin.top - opts.margin.bottom)- heightSquare])
                        .range([0,(opts.height)- heightSquare])

        const colorScale =  d3.scaleLinear()
                            .domain( opts.colors.domain )
                            .range( opts.colors.range );

        //TOOLTIP
        const tip =  d3tip()
                    .attr('class', 'd3-tip')
                    .attr("id", "tooltip")
                    .attr("data-year", (d) => 1234 )
                    .html( (d) =>  {
                        return `
                        <strong>Year:</strong> ${d.year}<br>
                        <strong>Month:</strong> ${d.month}<br>
                        <strong>Temperature:</strong> ${Math.round( (baseValue + d.variance) * 100) / 100}
                         
                        `;
                    }); 
        svg.call(tip);

        //TITLE
        svg.append("g")
        .append("text")
        .attr("text-anchor", "middle")
        .attr("id", "title")
        .attr("x", (opts.width/2) )
        .attr("y", opts.margin.top/2)
        .text("Monthly Global Land-Surface Temperature");

        //Description
        svg.append("g")
        .append("text")
        .attr("x", (opts.width)/2 )
        .attr("y", 5*opts.margin.top/6 )
        .attr("text-anchor", "middle")
        .attr("id", "description")
        .text("1753 - 2015");

        //DATA
        svg.append("g")
        .attr("transform", `translate(${opts.margin.left},${opts.margin.top})`)
        .selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("data-month", (d) => d.month - 1)
        .attr("data-year", (d) => d.year)
        .attr("data-temp", (d) => baseValue + d.variance )
        .attr("x", (d) => {
            return xScale( new Date(d.year, 0));
        })
        .attr("y", (d) => {
            return yScale(d.month);
        })
        .attr("height", heightSquare)
        .attr("width", widthSquare)
        .attr("stroke", (d) => colorScale( baseValue + d.variance ))
        .attr("stroke-width", 1)
        .attr("fill", (d) => colorScale( baseValue + d.variance ))
        .on('mouseover', (d,i) => {
            tip.attr("data-year", d.year)
            tip.show(d,i);
        })
        .on('mouseout', tip.hide);

        //X AXIS
        svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(${opts.margin.left}, ${opts.height + opts.margin.top})`)
        .call( d3.axisBottom(xScale)
            .tickArguments([d3.timeYear.every(10)]) 
        );

        //X AXIS NAME
        svg.append("text")
        .text("Years")
        .attr("class", "axis-name")
        .attr("text-anchor", "middle")
        .attr(
            "transform", 
            `translate(
                ${(opts.width/2 + opts.margin.left)}, 
                ${opts.height + opts.margin.top + opts.margin.bottom/2}
            )`
        );

        //Y AXIS
        const monthNameParser = (m) => {
            const month = months[m-1];
            return month.split("").filter( (e,i) => i < 3).join("") + ".";
        };
        const yAxis = svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(${opts.margin.left}, ${opts.margin.top + heightSquare/2})`)
        .call( d3.axisLeft(yScale)
            .tickFormat(monthNameParser)
        );
        yAxis.selectAll(".domain")
        .attr("stroke", "rgba(0,0,0,0)");
        yAxis.selectAll("g > line")
        .attr("stroke", "rgba(0,0,0,0)");
        


        //Y AXIS NAME
        svg.append("text")
        .text("Months")
        .attr("class", "axis-name")
        .attr("text-anchor", "middle")
        .attr(
            "transform", 
            `translate(${opts.margin.left/2}, ${opts.height/2 + opts.margin.top})rotate(-90)`
        )

        //LEGEND
        const legendDef = svg.append("defs")
        .append("linearGradient")
        .attr("id", "legend")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%")
        .attr("spreadMethod", "pad");

        legendDef.selectAll("stop")
        .data(opts.colors.range)
        .enter()
        .append("stop")
        .attr("offset", (d,i) => {
            const cantColors = opts.colors.range.length;
            const step = Math.round(100*100/ (cantColors-1))/100;
            return `${Math.round( step*(i) )}%`
        })
        .attr("stop-color", (d) => d)
        .attr("stop-opacity", 1);

        const legendScale = d3.scaleLinear()
                .domain( [  baseValue + d3.min(dataset  , (d) => d.variance) , 
                            baseValue + d3.max(dataset  , (d) => d.variance) ] )
                .range( [0, opts.legend.width ]);
        const legendAxis = d3.axisBottom(legendScale).tickFormat(d => d + "°C").ticks(4);

        const xLengend = opts.width - opts.legend.width;
        const yLengend= opts.height + opts.margin.top + opts.margin.bottom/2;

        svg.append("rect")
        .attr("width", opts.legend.width)
        .attr("height", opts.legend.height)
        .attr("x", xLengend )
        .attr("y", yLengend)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .style("fill", "url(#legend)");

        svg.append("g")
        .attr("transform", `translate(${xLengend}, ${yLengend + opts.legend.height})`)
        .call(legendAxis)

    }
    
    render() {

        return  (
            <div id="heatmapContainer" >
            </div>
        
        )
    }
}