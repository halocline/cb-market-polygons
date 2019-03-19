# cb-market-polygons Generates Market Polygons for Maps #

This application generates map polygons for a market based on the zipcodes
composing the market.

The app has a minimal UI to allow an end user to:

1. Generate an up to date market polygon based on the current market definition.
2. Render the generated market polygon as a layer in a Google map.

### Why Care? ###

Use Case: Service area businesses typically define operating regions, pricing,
availability, and more based off of zipcodes which they service. The ability to
display service area boundaries in a map is useful for:

* Visual interface to see if they fall within a service area

### Details ###

1. Data:  
  * Market definitions defined and live in database  
  * GeoJSON polygon definitions live in separate database
1. Creating market polygons:  
  * Get zipcodes for market of interest  
  * Query database for each polygon matching zipcodes  
  * Melts independent zipcode polygons into a single polygon representing the aggregate market  
1. Display market polygons:  
  * djafladf

## Getting Started ##

### Install Dependencies ###

```
#!bash
$ cd [path to your project directory]
$ npm update
$ npm install

```

### Create Local Datastore for GeoJSON Zipcode Shapefiles ###

#### 1) Zipcode shapefiles are found on data.gov:  ####
  * https://catalog.data.gov/dataset/tiger-line-shapefile-2014-2010-nation-u-s-2010-census-5-digit-zip-code-tabulation-area-zcta5-na/resource/5515a599-3457-40b7-a915-fc4a5ee47549  
  * (file is: http://www2.census.gov/geo/tiger/TIGER2014/ZCTA5/tl_2014_us_zcta510.zip)
  * Most recent as of Feb 27, 2019: https://www2.census.gov/geo/tiger/TIGER2018/ZCTA510/tl_2018_us_zcta510.zip

#### 2) Make 'data' directory to hold shapefile & download shapefiles ####

```
#!bash

$ cd [path to your project directory]
$ mkdir scripts/data
$ cd scripts/data
$ curl -O https://www2.census.gov/geo/tiger/TIGER2018/ZCTA510/tl_2018_us_zcta510.zip

```

#### 3) Unzip and convert shapefiles to JSON ####

!!! The next few commands will take awhile... !!!  
gdal is Geospatial Data Abstraction Library and has a lot to it.  
Converting the .shp to .geojson is also time consuming.

```
#!bash
$ unzip tl_2014_us_zcta510.zip -d ./
$ brew install gdal  ## Mac or for Linux $ apt-get install gdal-bin
$ ogr2ogr -f GeoJSON -t_srs crs:84 geojson_zips.geojson tl_2014_us_zcta510.shp

```

#### 4) Modify GeoJSON file ####

Isolating the "features" property which is an array of zipcode polygons in this
case.

```
#!bash
$ brew install jq
$ jq '.features' geojson_zips.geojson > zips.geojson

```

#### 5) Run script to load zipcode polygons into document Database ####

```
#!bash
$ cd ..
## NOTE: Ensure mongo is running prior
$ node add_zipcode_polygons_to_db_v1.2.js

```

## Starting the Server ##

```
#!bash
$ cd [path to your project directory]
$ npm update
$ npm install
$ node index.js

```
