import { useState } from 'react'
import './App.css'

function App() {
  const [medications, setMedications] = useState([''])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleMedicationChange = (e, index) => {
    const newMedications = [...medications]
    newMedications[index] = e.target.value
    setMedications(newMedications)
  }

  const handleAddMedication = () => {
    setMedications([...medications, ''])
  }

  const handleRemoveMedication = (index) => {
    const newMedications = [...medications]
    newMedications.splice(index, 1)
    setMedications(newMedications)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const results = []
    for (const medication of medications) {
      const res = await fetch(`https://api.fda.gov/drug/event.json?search=patient.drug.openfda.substance_name:${medication}&count=patient.reaction.reactionmeddrapt.exact`)
      const data = await res.json()
      const countResults = data.results
      const totalCount = countResults.reduce((acc, cur) => acc + cur.count, 0)
      const percentageResults = countResults.map((result) => {
        return {
          term: result.term,
          count: result.count,
          percentage: (result.count / totalCount) * 100,
        }
      })
      results.push(...percentageResults)
    }
    setLoading(false)
    setResults(orderByPercentage(results))
  }

  const orderByPercentage = (results) => {
    return results.sort((a, b) => b.percentage - a.percentage)
  }

  const sum = results ? results.reduce((acc, cur) => acc + cur.count, 0) : 0

  return (
    <section className="bg-blue-950 text-white">
      <form onSubmit={handleSubmit}>
        <div className="py-4">
          {medications.map((medication, index) => (
            <div key={index}>
              <label>Medication #{index + 1} </label>
              <input
                type="text"
                className="rounded-lg text-blue-950"
                value={medication}
                onChange={(e) => handleMedicationChange(e, index)}
              />
              <button type="button" onClick={() => handleRemoveMedication(index)} className='text-blue-950 ml-4 border-2 border-solid border-white w-auto p-1 rounded-lg bg-blue-100 px-2'>
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-row gap-4 py-2 justify-center text-blue-950">
          <button type="button" onClick={handleAddMedication} className='border-2 border-solid border-white w-auto p-1 rounded-lg bg-blue-100 px-2'>
            Add Medication
          </button>
          <button type="submit" className="border-2 border-solid border-white w-auto p-1 rounded-lg bg-blue-100 px-2">
            {loading ? 'Loading...' : 'Submit'}
          </button>
        </div>
      </form>
      <div className="container grid grid-cols">
        <ul>
          {results ? (
            results.map((result, index) => {
              return (
                <li key={index}>
                  <p>
                    {result.term} ({result.percentage.toFixed(2)}%)
                  </p>
                </li>
              )
            })
          ) : (
            <p>No results to display</p>
          )}
        </ul>
        </div>
      <div className="grid grid-cols-1 justify-center place-content-center justify-items-center py-4">
        <div className="font-bold">Total Count: {sum} </div>
      </div>
    </section>
  )
}

export default App