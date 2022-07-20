// update the scraper status table with the current time
// Call this function after the scraper has started scraping
async function UpdateScraperStatusTable(website) {
    // Create table if it doesn't exist
    var createQuery = `CREATE TABLE IF NOT EXISTS scrapestatus(id SERIAL, website TEXT, updatedAt timestamp default  current_timestamp) CONSTRAINT website_unique UNIQUE (website)`
    await pool.query(createQuery)
    // Insert into table or update if it already exists
    var insertQuery = `INSERT INTO scrapestatus(website,updatedAt) VALUES('${website}',current_timestamp) ON CONFLICT (website) DO UPDATE SET updatedAt=current_timestamp`
    const result = await pool.query(insertQuery)
    return result
}

// return the last time the scraper was updated
async function getScraperStatusTableUpdatedAt(website) {
    var getQuery = `SELECT updatedAt FROM scrapestatus WHERE website='${website}'`
    const result = await pool.query(getQuery)
    return result
}

