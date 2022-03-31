import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_MLS_THOUGHT } from '../../utils/mutations';
import { QUERY_MLS_THOUGHTS , QUERY_ME } from '../../utils/queries';


const ThoughtForm = () => {
  const [addThought, { error }] = useMutation(ADD_MLS_THOUGHT, {
    update(cache, { data: { addThought } }) {
      try {
      // could potentially not exist yet, so wrap in a try...catch
      // read what's currently in the cache
      const { thoughts } = cache.readQuery({ query: QUERY_MLS_THOUGHTS  });
      cache.writeQuery({
        query: QUERY_MLS_THOUGHTS ,
        data: { mlsThoughts: [addThought, ...thoughts] }
      });
    } catch (e) {
      console.error(e);
    }
      // update me object's cache, appending new thought to the end of the array
      // prepend the newest thought to the front of the array
      const { me } = cache.readQuery({ query: QUERY_ME });
      cache.writeQuery({
        query: QUERY_ME,
        data: { me: { ...me, mlsThoughts: [...me.mlsThoughts, addThought] } }
      });
    }
  });

  const [thoughtText, setText] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  
  const handleChange = event => {
    if (event.target.value.length <= 280) {
      setText(event.target.value);
      setCharacterCount(event.target.value.length);
    }
  };
  
  const handleFormSubmit = async event => {
    event.preventDefault();
    try {
      // add thought to a database
      await addThought ({
        variables: { thoughtText }
      });

      // clear form value
      setText('');
      setCharacterCount(0);
    } catch (e) {
      console.error(e);
    }
    
    
  };

  return (
    <div>
      
      <p className={`m-0 ${characterCount === 280 ? 'text-error' : ''}`}>
        Character Count: {characterCount}/280
        {error && <span className="ml-2"> Something went wrong...</span>}
      </p>
      <form className="flex-row justify-center justify-space-between-md align-stretch" onSubmit={handleFormSubmit}>
        <textarea
          placeholder="Here's a new thought..."
          value={thoughtText}
          className="form-input col-12 col-md-9"
          onChange={handleChange}
          
        ></textarea>
        <button className="btn col-12 col-md-3" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default ThoughtForm;