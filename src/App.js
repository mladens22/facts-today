import { useEffect, useState } from "react";
import supabase from "./supabase";
import "./style.css";
import 'animate.css';


const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

const initialFacts = [
  {
    id: 1,
    text: "React is being developed by Meta (formerly facebook)",
    source: "https://opensource.fb.com/",
    category: "technology",
    votesInteresting: 24,
    votesMindBlowing: 9,
    votesFalse: 4,
    createdIn: 2021,
  },
  {
    id: 2,
    text: "Millennial dads spend 3 times as much time with their kids than their fathers spent with them. In 1982, 43% of fathers had never changed a diaper. Today, that number is down to 3%",
    source:
      "https://www.mother.ly/parenting/millennial-dads-spend-more-time-with-their-kids",
    category: "society",
    votesInteresting: 11,
    votesMindBlowing: 2,
    votesFalse: 0,
    createdIn: 2019,
  },
  {
    id: 3,
    text: "Lisbon is the capital of Portugal",
    source: "https://en.wikipedia.org/wiki/Lisbon",
    category: "society",
    votesInteresting: 8,
    votesMindBlowing: 3,
    votesFalse: 1,
    createdIn: 2015,
  },
];

function App() {

  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(() => {

    async function getFacts() {
      setIsLoading(true);

      let query = supabase.from('facts')
        .select('*');

      if (currentCategory !== "all")
        query = query.eq("category", currentCategory)

      const { data: facts, error } = await query
        .order("votesInteresting", { ascending: false })
        .limit(1500);
      if (!error) setFacts(facts);
      else alert(error.message);
      setIsLoading(false);
    }
    getFacts();

  }, [currentCategory])

  return (

    <>

      <Header showForm={showForm} setShowForm={setShowForm} />

      {showForm ? <NewFactForm setFacts={setFacts} setShowForm={setShowForm} /> : null}

      <main className="main">

        <CategoryFilter setCurrentCategory={setCurrentCategory} />

        {isLoading ? <Loader /> : <FactList facts={facts} setFacts={setFacts} />}

      </main>
    </>
  )
}

function Loader() {
  return (
    <p className="message">Loading...</p>
  )
}


function Header({ showForm, setShowForm }) {
  return (
    <header className="header">
      <div className="logo">
        <img
          src="logo.png"
          height="68"
          width="68"
          alt="Facts Today Logo"
        />
        <h1 className="animate__animated animate__shakeX animate__delay-2s">Facts Today</h1>
      </div>

      <button className="btn btn-large btn-open" onClick={() => setShowForm((show) => !show)}>{showForm ?
        'Close' : 'Share a fact'}</button>


    </header>
  )
}

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }) {

  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('');
  const [isUpload, setIsUpload] = useState(false);
  const textLength = text.length;


  async function handleSubmit(e) {
    e.preventDefault();
    // 2. check if data is valid. if so create new fact

    if (text && isValidHttpUrl(source) && category && textLength <= 200) {

      // 3. upload fact to database 

      setIsUpload(true);
      const { data: newFact, error } = await supabase.from("facts").insert([{ text, source, category }])
        .select()
      setIsUpload(false);


      // 4. add the new fact to the UI 

      if (!error)
        setFacts((facts) => [newFact[0], ...facts]);
      // 5. reset the input fields to be empty 

      setText('');
      setSource('');
      setCategory('');

      // 6. close the entire form  

      setShowForm(false);
    }
  }

  return (

    <form className="fact-form" onSubmit={handleSubmit}>
      <input type="text" placeholder="Share a fact with the world..." value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={setIsUpload}
      />
      <span>{200 - textLength}</span>
      <input value={source} type="text" placeholder="Source"
        onChange={(e) => setSource(e.target.value)}
        disabled={setIsUpload}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}
        disabled={setIsUpload}>
        <option value="">Choose category:</option>
        {CATEGORIES.map((el) => (
          <option key={el.name} value={el.name}>
            {el.name.charAt(0).toUpperCase() + el.name.slice(1)}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={setIsUpload}>Post</button>
    </form>
  )
}

function CategoryFilter({ setCurrentCategory }) {
  return <aside>
    <ul>
      <li className="category">
        <button className="btn btn-all-categories" onClick={() => setCurrentCategory('all')}>All</button>
      </li>
      {CATEGORIES.map((cat) =>
        <li key={cat.name} className="category">
          <button
            className="btn btn-category"
            style={{ backgroundColor: cat.color }}
            onClick={() => setCurrentCategory(cat.name)}

          >
            {cat.name}
          </button>
        </li>
      )}


    </ul>
  </aside >
}

function FactList({ facts, setFacts }) {

  if (facts.length === 0)
    return <p className="message">No facts for this category. Add your own.</p>


  return <section>
    <ul className="facts-list">
      {facts.map((fact) => <Fact key={fact.id} fact={fact} setFacts={setFacts} />)
      }
    </ul>
    <p className="length">There are {facts.length} facts in the database.</p>
  </section>

}



function Fact({ fact, setFacts }) {

  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed = fact.votesInteresting + fact.votesMindBlowing < fact.votesFalse;

  async function handleVote(column) {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase.from('facts').update
      ({ [column]: fact[column] + 1 })
      .eq("id", fact.id)
      .select();

    setIsUpdating(false);


    if (!error) setFacts((facts) => facts.map((f) => f.id === fact.id ? updatedFact[0] : f))
  }
  return (

    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed">[FALSE INFORMATION]</span> : null}
        {fact.text}
        <a
          className="source"
          href={fact.source}
          target="_blank"
          rel="noreferrer"
        >(Source)</a>
      </p>
      <span className="tag" style={{
        backgroundColor: CATEGORIES.find((cat) =>
          cat.name === fact.category).color
      }}
      >{fact.category}</span>
      <div className="vote-buttons">
        <button onClick={() => handleVote("votesInteresting")} disabled={isUpdating}>👍 {fact.votesInteresting}</button>
        <button onClick={() => handleVote("votesMindBlowing")} disabled={isUpdating}>🤯 {fact.votesMindBlowing}</button>
        <button onClick={() => handleVote("votesFalse")} disabled={isUpdating}>⛔️ {fact.votesFalse}</button>
      </div>
    </li>
  )
}

export default App;
