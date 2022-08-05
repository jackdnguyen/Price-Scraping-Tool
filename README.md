# START-UP GUIDE



# THINGS NEED TO BE INSTALLED
NodeJS \
PostgreSQL

# AFTER INSTALLATION
1. Add Postgres/lib and Postres/bin from the installed location to the windows environment variables PATH
2. If scripts can't be run, then SET-EXECUTIONPOLICY to RemoteSigned by opening windows powershell as administrator
2. Add the database name and password to the .env DATABASE_URL, for example, postgres://postgres:password@localhost/databaseName
3. Run npm install, npm i knex -g, npm i nodemon -g commands separately in the terminal to install the required packages and dependencies
4. Run knex migrate:latest command in the terminal to migrate the tables in the local database
5. Run nodemon or node index.js command in the terminal to run the app locally
6. The default user name for the app is admin and password is scraper.


<!-- ---------------------------------------------------------------------- -->

# Group 4

Jack Nguyen  \
Tosrif Jahan Sakib \
Sameer Ali  \
Melody Shih  \
Daniel Vuksan 

# ---------------------------------------------------------

<!-- --------------------------------------------------------------------- -->

Price Scraping Tool \
Requirements and Specification Document \
08/03/2022, version 3 

# Project Abstract

Price Scraping Tool is a stand-alone application that will crawl website URLs (specifically goemans.com, canadianappliance.com, www.midlandappliance.com for iteration 3) in order to gather competitive pricing intelligence by retrieving each product data. Logging into the application will lead to the URL page, where the user selects which scraping profile to use (each profile is linked to a different URL). A scraping profile is the set of scraping rules that make a site or multiple sites. After entering the specified websites, the user can then click on the button ‘scrape’ to invoke the scripts that will gather product data and post onto a database. In the header of the application includes the page ‘Scraped Data’ which displays the product data gathered from the database. Invoking ‘scrape’ will either update or insert products into the database. The customer asked that we do not include a sign-up option for the application but rather an admin login.

 Login Details: {user: ‘admin’, password: ‘scraper’}.


# Customer

The customer of this application is Coast Appliances who will make use of the Price Scraping Tool to gather competitive pricing intelligence. With this data, they will be able to choose whether to match their price or offer a better deal on products identified with SKU. To stay competitive in this modern era of business, companies must adapt, change and/or react to the intelligence collected. Price Scraping Tool allows Coast Appliances to gather that intelligence.


# Competitive Analysis

Competitors in this market are other scraping tools that gather information from e-commerce sites. They scrape data via web scraping (Price Scraping Tool utilizes this method) or robotic process automation (RPA).  In RPA the bot is programmed to access target websites at certain time intervals, track the activity of the websites, and observe pricing data changes. What differs us from our competitors is the fact that we are able to scrape each individual product data from our URLs which require a specific scraping profile. A general web scraping tool cannot provide adequate intelligence to the customer due to scraping profile’s not being specific enough. Whereas Price Scraping Tool’s scraping profile provides detailed extraction of data of the given URLs in order to deliver the URL, SKU, product name, last modified, and pricing of each individual product to the customer.




# User Stories
Users of this application may include a price analyst, or a search engine optimization (SEO) examiner. A price analyst is someone who wants to analyze the pricing of appliance products in order to make comparisons between competitors in the space. The price analyst shall be able to use Price Scraping Tool to crawl websites that sell appliances and make comparisons based off the prices that are scraped onto the database. The precondition is that the price analyst must examine websites that link to our scraping profiles. A successful case would be that the website is in our profile and is able to provide the user with product pricing. Failed cases would be where the user inputs a URL outside our scraping profile reach. Price Scraping Tool will scrape through each product from extracting URLs from the website's sitemap and provide the user with the data. A search engine optimization examiner is someone who examines which product SKUs are websites using to drive up SEO traffic. For example, if someone were to google the product “fridge” and click on a link that sells the product, but it is out of stock or discontinued by the seller, then the seller is using that product SKU to drive up SEO traffic. The search engine optimization examiner shall be able to use Price Scraping Tool to identify which products the websites are using to drive up SEO traffic by putting the website’s URL in the input box and clicking ‘scrape’. The application will then scrape all products onto the database, even products with no pricing or are discontinued. We currently identify these products by setting the price to ‘0’ in the database. Similar to the price analyst, the precondition of this user story is that the websites must be within reach of our scraping profiles. Therefore, a successful case would be a website in our profile and a failed case would be a website that is not. The system state will have saved each product of the websites onto the database after the user stories have completed. 

For iteration 2, we’ve tested 1000 products on both websites and the application is able to provide the user with adequate data locally, but on Heroku there’s no available ram to be able to scrape websites in a reasonable time frame. 

For iteration 3, we’ve tested all the products from 4 different profiles and stored them locally. We updated SKU filter for handling any inputs and added low/high filter which compares prices of Coast Appliances with other companies. Download option is added as well to give the user the option to download data in a CSV file. Finally, KnexJS was implemented for database migration so it will be easier for any user to create the tables in their environment without the need to manually create tables in the database. 


Iteration 1: Scraping singular URL\
Actor: Search engine optimization examiner\
Precondition: User is logged in\
Postcondition: User selects the profile of the URL they would like to scrape, and then they press the scrape button which runs the designated script for the profile.

Acceptance Tests:\
Scrape-> access URL\
    ->find product information\
    ->finds SKU and related information\
    ->stores product in database


Iteration 2: Scraping URLS\
Actor: Price analyst (admin)\
Precondition: User is logged in\
Postcondition: User selects the profile of the URL(s) they want to scrape, and then they press the scrape button which runs the designated scripts to scrape the data of the profiles that they have selected.

Acceptance Tests: \
Scrape data -> accesses the URLs\
-> sifts through the information of the website\
->looks for “products”\
->checks that the product has a SKU (this determines that it is a product)\
->grabs data of the product and other related data\
->stores the product data in database

Filtering SKU data\
Actor: Price analyst (admin)\
Precondition: User is logged in\
Postcondition: User accesses the “scraped data” page, and then filters by a specific SKU. Once that is entered, the data from different profiles containing that SKU is presented, so that the data can be compared

Acceptance Tests:\
Filtering by SKU -> enter SKU in the “scraped data” page\
            ->searched through database for that SKU\
            ->asserts that the SKU matches with the user input\
            ->finds data associated with that product\
            ->presents product information 




Iteration 3: Downloading data as CSV \
Actor: Price analyst (admin) \
Precondition: User is logged in \
Postcondition: User accesses the “scraped data” page, and then views the data that is already scraped. They then press the button that allows them to turn the data into a csv file that can be viewed in programs such as excel. 

Acceptance Tests: \
Downloading CSV -> presses download as csv \
            ->searched through database for data related to each SKU \
            ->finds associated data \
            ->transforms data in database into csv file 






Comparing SKU data \
Actor: Price analyst (admin) \
Precondition: User is logged in \
Postcondition: User accesses the “Scraped data” page, and then compares the data with coast appliances, to see which products cost more or less 

Acceptance Tests: \
Compare data-> compare products amongst each other \
    `    -> find prices of each product \
        -> compare other companies with coastal appliances \
        -> display either higher costs or lower 



# Velocity Measurement:

-Login (3) \
-SKU Filter (3) \
-Scrape (3) \
-Logout (2) \
-URL page (2) \
-Scrape multiple URLs (3) \
-Progress Update (3) \
-Database page (3) \
-KnexJs for database migration (3) \
-Compare low/ high prices (3) \
-Download CSV file (3) \
-Tests (2) 

33/3 = 11


