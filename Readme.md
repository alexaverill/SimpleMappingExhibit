# Simple Mapping Exhibit

A completely local and easy to setup mapping exhibit intended for Museums who want to create and display custom GIS like mapping experiances.

## [Demo](https://maps.averill.dev)

## [Editor Demo](https://maps.averill.dev/create.html)

## Features

1. Points of Interest tied to an Image Viewer and Text Content.
1. Supports any online tiled mapping base layers.
1. Multi-language support.
1. Lock the map to specific bounds.
1. Lock the map to specific zoom levels.
1. Guided map creation editor.
1. Can be run on desktop or mobile.
1. Easily run it locally.

# Setup

Running locally is a breeze, you can download this repo, and then open either the index.html or create.html in a browser and get started immediately.

Once you have created a map with the create.html, simply replace the data.json file thats next to the index.html with the output you get from the create.html

## Troubleshooting

1. I set up my map and zoom levels, but when I zoom in to far on one of my base layers it goes grey!
   This is likely caused by having a base layer that doesn't support that zoom level, double check the values provided with the map tiles, or load your data into the editor and then test the zoom levels and set the maximum level so that the map doesn't go grey.
