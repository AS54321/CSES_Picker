import { useState, useEffect } from "react";
import './index.css';

type Problem = {
  title: string;
  url: string;
  id: string;
};

type ProblemMap = Record<string, Problem[]>;


const App = () => {
  const [csesData, setCsesData] = useState<ProblemMap>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  type ProblemStatus = {
    solved?: boolean;
    bookmarked?: boolean;
  };


  const [problemStatus, setProblemStatus] = useState<Record<string, ProblemStatus>>({});

  useEffect(() => {
    fetch("http://localhost:3001/api/status")
      .then((res) => res.json())
      .then((data) => setProblemStatus(data));
  }, []);

  /* the below code was being used when i hadn't added proper backend and was relying on local storage */
  // useEffect(() => {
  //     const saved = localStorage.getItem("problemStatus");
  //     if (saved) setProblemStatus(JSON.parse(saved));
  //   }, []);

  useEffect(() => {
    fetch("/cses_problems_by_topic.json")
      .then((res) => res.json())
      .then(setCsesData);
  }, []);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const updateStatus = (id: string, status: ProblemStatus) => {
    const updated = {
      ...problemStatus,
      [id]: {
        ...problemStatus[id],
        ...status,
      },
    };
    setProblemStatus(updated);
    fetch("http://localhost:3001/api/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, ...updated[id] }),
    });
  };

  const toggleSolved = (id: string) => {
    updateStatus(id, { solved: !problemStatus[id]?.solved });
  };

  const toggleBookmark = (id: string) => {
    updateStatus(id, { bookmarked: !problemStatus[id]?.bookmarked });
  };


  /* for this code also the same story */
  // const toggleSolved = (id: string) => {
  //   setProblemStatus((prev) => {
  //     const updated = {
  //       ...prev,
  //       [id]: {
  //         ...prev[id],
  //         solved: !prev[id]?.solved,
  //       },
  //     };
  //     localStorage.setItem("problemStatus", JSON.stringify(updated));
  //     console.log("Toggled solved:", id, updated[id]);
  //     return updated;
  //   });
  // };

  // const toggleBookmark = (id: string) => {
  //   setProblemStatus((prev) => {
  //     const updated = {
  //       ...prev,
  //       [id]: {
  //         ...prev[id],
  //         bookmarked: !prev[id]?.bookmarked,
  //       },
  //     };
  //     localStorage.setItem("problemStatus", JSON.stringify(updated));
  //     console.log("Toggled bookmarked:", id, updated[id]);
  //     return updated;
  //   });
  // };


  const getFilteredProblems = () => {
    return selectedCategories.flatMap(
      (category) => csesData[category] || []
    );
  };

  const handlePickRandom = () => {
    const problems = getFilteredProblems();
    if (problems.length === 0) {
      alert("No problems selected.");
      return;
    }
    const randomIndex = Math.floor(Math.random() * problems.length);
    const randomProblem = problems[randomIndex];
    window.open(randomProblem.url, '_blank');
  };

  return (
    <div className="flex h-screen">
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4">CSES Random Problem Picker</h1>

        <button
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handlePickRandom}
        >
          Pick Random Problem
        </button>


        {/* Filtered Problems - Add here */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Filtered Problems:</h2>
          {getFilteredProblems().length === 0 ? (
            <p className="text-gray-500 italic">No problems selected.</p>
          ) : (
            <ul className="space-y-2">
              {getFilteredProblems().map((problem) => (
                <li
                  key={problem.id}
                  className="p-2 border rounded bg-white shadow-sm flex justify-between items-center"
                >
                  <a
                    href={problem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {problem.title}
                  </a>


                  <div className="flex space-x-2">
                    {/* <div className="text-xs text-gray-600">
                      solved: {problemStatus[problem.id]?.solved ? "yes" : "no"} |
                      bookmarked: {problemStatus[problem.id]?.bookmarked ? "yes" : "no"}
                    </div> */}
                    <button
                      onClick={() => toggleSolved(problem.id)}
                      className={`px-2 py-1 text-sm rounded ${problemStatus[problem.id]?.solved
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-800"
                        }`}
                    >
                      ✓ Solved
                    </button>
                    <button
                      onClick={() => toggleBookmark(problem.id)}
                      className={`px-2 py-1 text-sm rounded ${problemStatus[problem.id]?.bookmarked
                        ? "bg-yellow-400 text-white"
                        : "bg-gray-200 text-gray-800"
                        }`}
                    >
                      ★ Bookmark
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>



      {/* Filter Sidebar */}
      <aside className={`w-72 border-l p-4 bg-gray-50 ${showFilters ? "" : "hidden"}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Filters</h2>
          <button onClick={() => setShowFilters(false)}>×</button>
        </div>
        {Object.keys(csesData).map((category) => (
          <label key={category} className="block mb-2">
            <input
              type="checkbox"
              checked={selectedCategories.includes(category)}
              onChange={() => toggleCategory(category)}
              className="mr-2"
            />
            {category}
          </label>
        ))}
      </aside>

      {!showFilters && (
        <button
          onClick={() => setShowFilters(true)}
          className="absolute top-4 right-4 px-2 py-1 bg-gray-300 rounded"
        >
          Show Filters
        </button>
      )}
    </div>
  );
};

export default App;
