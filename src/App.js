import React, { useState, useEffect, useRef } from "react";
import HeaderLogo from './assets/header-img.png';
import SearchIcon from './assets/search.png';
import Answer from './assets/answer-img.png';
import Pinboard from './assets/pinboard-img.png';

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

  const debounceTimer = useRef(null);
  const abortController = useRef(null);

  // Fetch data from the API
  const fetchData = async () => {
    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        'http://localhost:9200/obj_search_stage/_search',
        {
          method: "GET",
          signal: abortController.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();
      const mappedData = result.hits.hits.map((hit) => ({
        NAME: hit._source.NAME,
        DESCRIPTION: hit._source.DESCRIPTION,
        OBJECT_TYPE_FACET:  hit._source.OBJECT_TYPE_FACET,
        MODIFIED_MS: hit._source.MODIFIED_MS,
        IMPRESSIONS_OVERALL: hit._source.IMPRESSIONS_OVERALL,
        IS_VERIFIED: hit._source.IS_VERIFIED,
        AUTHOR: hit._source.AUTHOR,
      }));
      setData(mappedData);
      setSelectedItem(mappedData[0]);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (searchQuery) => {
    setQuery(searchQuery);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchQuery.length >= 3) {
      debounceTimer.current = setTimeout(() => {
        fetchData();
      }, 500);
    } else {
      setData([]);
      setSelectedItem(null);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
  
    if (diff < 0) {
      return "Created just now";
    }
  
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30); // Approximate a month as 30 days
    const years = Math.floor(days / 365); // Approximate a year as 365 days
  
    if (years > 0) {
      return `Created ${years} year${years > 1 ? "s" : ""} ago`;
    } else if (months > 0) {
      return `Created ${months} month${months > 1 ? "s" : ""} ago`;
    } else if (weeks > 0) {
      return `Created ${weeks} week${weeks > 1 ? "s" : ""} ago`;
    } else if (days > 0) {
      return `Created ${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      return `Created ${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
      return `Created ${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
      return `Created ${seconds} second${seconds > 1 ? "s" : ""} ago`;
    }
  }

  return (
    <div style={{ backgroundColor: '#F6F8FA' }}>
      <div>
        <img style={{ width: '100%', height: '55px' }} src={HeaderLogo} alt="Header Logo" />
      </div>
      <div style={{ padding: "30px", display: "flex", borderBottom: '1px solid #DBDFE7', marginBottom: '10px', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          style={{
            display: "flex",
            padding: "14px 20px",
            width: "100%",
            marginBottom: "20px",
            borderRadius: "40px",
            border: '1px solid',
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
          onClick={() => query.length >= 3 && fetchData()}
        >
          <img style={{ width: '40px' }} src={SearchIcon} alt="Search Icon" />
        </div>
      </div>
      {/* Other components remain unchanged */}
      {data.length === 0 && !loading && <p style={{ color: "#888", textAlign: 'center', height:  "calc(100vh - 220px)" }}>No results found.</p>}
      {loading && <p>Loading...</p>}
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
                  display: 'flex',
                  cursor: "pointer",
                  backgroundColor: selectedItem === item ? "#f2f7ff" : "#fff",
                  borderBottom: '1px solid rgb(219, 223, 231)'
                }}
              ><div style={{marginRight: '10px'}}>
                {/* OBJECT_TYPE_FACET */}
                {item.OBJECT_TYPE_FACET === 'ANSWER' && <img style={{ width: '24px' }} src={Answer} alt="Search Icon" />}
                {item.OBJECT_TYPE_FACET === 'PINBOARD' && <img style={{ width: '24px' }} src={Pinboard} alt="Search Icon" />}
              </div>
                <div>
                <a style={{color: '#2770EF', fontWeight: '600', fontSize: '18px'}}>{item.NAME}</a>
                <p style={{fontSize: '14px', fontStyle: 'italic'}}>{item.DESCRIPTION}</p>
                <p style={{fontSize: '14px'}}>{getTimeAgo(item.MODIFIED_MS)} by <a style={{color: '#2770EF'}}>{item.AUTHOR}</a></p>
                <p style={{margin: '0', fontSize: '14px'}}>{item.IMPRESSIONS_OVERALL} views</p>
                {item.IS_VERIFIED && <span style={{color: '#2770EF'}}>VERIFIED</span>}
                </div>
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
              <h3 style={{fontWeight: '600', fontSize: '18px'}}>{selectedItem.NAME}</h3>
              {selectedItem.OBJECT_TYPE_FACET === 'ANSWER' && <p style={{fontSize: '12px'}}>Answer</p>}
              {selectedItem.OBJECT_TYPE_FACET === 'PINBOARD' && <p style={{fontSize: '12px'}}>Liveboard</p>}
              <p style={{fontSize: '14px'}}>{selectedItem.DESCRIPTION}</p>
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
