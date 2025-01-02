import React, { useState, useEffect } from "react";
import HeaderLogo from './assets/header-img.png';
import SearchIcon from './assets/search.png';

// Utility function to format date
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};


const SearchResults = () => {
  const [query, setQuery] = useState("sales");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch data from the API
  // THis we can replace as per our curl
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        'http://localhost:9200/obj_search_stage/_search',
        {
          method: "GET"
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();
      console.log("result", result);
      // Map the response data to match the structure of your exampleData
      const mappedData = result.hits.hits.map((hit) => ({
        NAME: hit._source.NAME,
        DESCRIPTION: hit._source.DESCRIPTION,
        MODIFIED_MS: hit._source.MODIFIED_MS,
        IMPRESSIONS_OVERALL: hit._source.IMPRESSIONS_OVERALL,
        IS_VERIFIED: hit._source.IS_VERIFIED,
        AUTHOR: hit._source.AUTHOR
      }));
      console.log("mappedData", mappedData);
      setData(mappedData);
      setSelectedItem(mappedData[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


useEffect(() => {
  fetchData();
}, []);

  const getSearchData = (searchQuery) => {
    setQuery(searchQuery);
    fetchData();
  };

  // Filter the search results based on the query
  // const filteredResults = data.filter((item) =>
  //   item.NAME.toLowerCase().includes(query.toLowerCase())
  // );

  //   "AUTHOR_DISPLAY_NAME"
  // "DESCRIPTION"
  // "CREATED_MS"
  // "IMPRESSIONS_OVERALL" views
  // IS_VERIFIED

  return (
    <div style={{backgroundColor: '#F6F8FA'}}>
      <div>
        <img style={{width: '100%', height: '55px'}} src={HeaderLogo}></img>
      </div>
      <div style={{ padding: "30px", display: "flex", borderBottom: '1px solid #DBDFE7', marginBottom: '10px', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={query}
          onChange={(e) => getSearchData(e.target.value)}
          style={{
            display: "flex",
            padding: "14px 20px",
            width: "100%",
            marginBottom: "20px",
            borderRadius: "40px",
            border: '1px solid'
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            right: "31px",
            top: "29px",
            bottom: 0,
            cursor: "pointer",
            marginTop: ".2857142857rem",
            marginRight: ".2857142857rem",
            width: "44px",
            height: "30px",
            padding: ".2857142857rem 1.1428571429rem",
            borderRadius: "2.8571428571rem",
            background: "#2770EF",
          }}
          onClick={() => getSearchData(query)}
        >
          <img style={{width: '40px'}} src={SearchIcon} />
        </div>
      </div>
      {/* Left-side list */}
      {data.length === 0 && !loading && (
        <p style={{ color: "#888", textAlign: 'center' }}>No results found.</p>
      )}
      {data.length > 0 && !loading && <div style={{background: '#fff',
    margin: '0 10px',
    padding: '20px 0', borderBottom: '1px solid #DBDFE7'}}><p style={{margin: '0 10px', fontWeight: '600'}}>Showing Result for '{query}'</p><p style={{margin: '0 10px 10px 10px', fontSize: '10px'}}>Found {data.length} results</p></div>}
    {loading && <p>Loading...</p>}
      {(data.length > 0 && !loading) && <div style={{ display: "flex", margin: '0 15px' }}>
        <div
          style={{
            width: "75%",
            maxHeight: "calc(100vh - 330px)",
            overflowY: "scroll",
          }}
        >
          {error && <p style={{ color: "red" }}>{error}</p>}

          <div>
            {data.map((item, index) => (
              <div
                key={index}
                onClick={() => setSelectedItem(item)}
                style={{
                  borderRadius: "5px",
                  padding: "15px",
                  cursor: "pointer",
                  backgroundColor: selectedItem === item ? "#f2f7ff" : "#fff",
                  borderBottom: '1px solid rgb(219, 223, 231)'
                }}
              >
                <a style={{color: '#2770EF', fontWeight: '600', fontSize: '18px'}}>{item.NAME}</a>
                <p>Last Modified: {formatDate(item.MODIFIED_MS)} by <a style={{color: '#2770EF'}}>{item.AUTHOR}</a></p>
                <p>{item.IMPRESSIONS_OVERALL} views</p>
                {item.IS_VERIFIED && <span style={{color: '#2770EF'}}>VERIFIED</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Right-side details */}
        <div
          style={{
            width: "25%",
            borderLeft: "1px solid #ccc"
          }}
        >
          {selectedItem ? (
            <div style={{backgroundColor: '#fff', padding: '20px', height: '100%'}}>
              <p>Details</p>
              <h3 style={{fontWeight: '500'}}>{selectedItem.NAME}</h3>
              <p>{selectedItem.DESCRIPTION}</p>
            </div>
          ) : (
            <p style={{ color: "#888" }}>
              Click on a list item to see details here.
            </p>
          )}
        </div>
      </div>}
    </div>
  );
};

export default SearchResults;
