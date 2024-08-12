import React, { useState, useEffect } from "react";
import axios from "axios";
import Autosuggest from "react-autosuggest";
import Papa from 'papaparse';
import './MovieRecommend.css';
import Navbar from './Navbar'

const defaultPosterUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWz9tftw9qculFH1gxieWkxL6rbRk_hrXTSg&s';

const MovieRecommend = () => {
    const [movieName, setMovieName] = useState("");
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [movieTitles, setMovieTitles] = useState([]); 
    const [suggestions, setSuggestions] = useState([]); 

   
    useEffect(() => {
        const fetchMovieTitles = async () => {
            try {
                const response = await axios.get("/netflix_titles.csv");

                // Parse CSV data using PapaParse
                Papa.parse(response.data, {
                    header: true, // Assuming the first row is headers
                    complete: (result) => {
                        if (Array.isArray(result.data)) {
                            const titles = result.data.map(row => row.title).filter(title => title); // Filter out any empty titles
                            setMovieTitles(titles);
                        } else {
                            console.error("Unexpected data format:", result.data);
                        }
                    },
                    error: (error) => {
                        console.error("Error parsing CSV:", error);
                    }
                });
            } catch (error) {
                console.error("Error fetching movie titles:", error);
            }
        };

        fetchMovieTitles();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setRecommendations([]);
        setError("");
        setLoading(true);

        try {
            const response = await axios.get("http://127.0.0.1:5000/recommend", {
                params: { movieName },
                timeout: 15000 
            });

            console.log(response.data); 


            const recommendationsWithPosters = await Promise.all(
                response.data.recommendations.map(async (recommendation) => {
                    const { title, description } = recommendation;
                    try {
                        const { data } = await axios.get("https://www.omdbapi.com/", {
                            params: {
                                apikey: 'fa3e74cc',
                                t: title
                            },
                            timeout: 15000 
                        });
            
                        return {
                            title,
                            description, // Include description
                            posterUrl: data.Poster && data.Poster !== 'N/A' ? data.Poster : defaultPosterUrl
                        };
                    } catch (posterErr) {
                        console.error("Error fetching poster:", posterErr);
                        return {
                            title,
                            description, // Include description in case of error as well
                            posterUrl: defaultPosterUrl
                        };
                    }
                })
            );
            setRecommendations(recommendationsWithPosters);
        } catch (err) {
            console.error("Error fetching recommendations:", err.response ? err.response.data : err.message);
            setError("Content not found. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getSuggestions = (value) => {
        if (!movieTitles) return [];
        
        const inputValue = value.trim().toLowerCase();
        return movieTitles
            .filter(title => title.toLowerCase().includes(inputValue))
            .map(title => ({ title }));
    };



    const renderSuggestion = (suggestion) => (
        <div style={{ padding: '10px', borderBottom: '1px solid #ccc' , cursor:'pointer' , listStyle:'none' , width:'100%'}}>
            {suggestion.title}
        </div>
    );

    const onSuggestionsFetchRequested = ({ value }) => {
        setSuggestions(getSuggestions(value));
    };

    const onSuggestionsClearRequested = () => {
        setSuggestions([]);
    };

    const onChange = (event, { newValue }) => {
        setMovieName(newValue);
    };

    const inputProps = {
        placeholder: `I want to watch movies/shows like...`,
        value: movieName,
        onChange,
        style :{
            width :'120%',
            outline :' none',
            padding :'1rem',
            borderRadius : '0.5rem',
            height:'1rem'
        }
    };

    return (
        <div>
            <Navbar></Navbar>
        <div className="container w-75 mt-5">
            <h3 className="mb-4">Similar Netflix Contents</h3>
            <form onSubmit={handleSubmit} className="mb-4 search-bar">
                <div className="mb-3">
                    <Autosuggest
                        suggestions={suggestions}
                        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                        onSuggestionsClearRequested={onSuggestionsClearRequested}
                        getSuggestionValue={suggestion => suggestion.title}
                        renderSuggestion={renderSuggestion}
                        inputProps={inputProps}
                        theme={{
                            container: 'react-autosuggest__container',
                            input: 'react-autosuggest__input',
                            suggestionsContainer: 'react-autosuggest__suggestions-container',
                            suggestion: 'react-autosuggest__suggestion',
                            suggestionHighlighted: 'react-autosuggest__suggestion--highlighted'
                        }}
                    />
                </div>
                <button type="submit" className="btn find-button btn-dark" disabled={loading}>
                    {loading ? "Loading..." : "Show Similars" }
                </button>
            </form>
            {loading && <div className="spinner-border" role="status"><span className="sr-only"></span></div>}
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="row">
                {recommendations.map((movie, index) => (
                    <div className="col-sm-12 col-md-6 col-lg-4 mb-4" key={index}>
                        <div className="card" style={{ height: '90vh' }}>
                            <img
                                className="card-img-top"
                                src={movie.posterUrl}
                                alt={movie.title}
                                style={{ height: '60vh' }}
                            />
                            <div className="card-body">
                                <h5 className="card-title" style={{fontWeight:'700'}}>{movie.title}</h5>
                                <p className="card-text">{movie.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
    );
};

export default MovieRecommend;
