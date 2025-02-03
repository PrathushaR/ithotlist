import { useState } from "react"
import { useDispatch } from "react-redux"
import TitleCard from "../../components/Cards/TitleCard"
import { showNotification } from "../common/headerSlice"
import axios from 'axios'

const INITIAL_CANDIDATES_LIST = [
    {id: "JD001", name: "Sarah Wilson", yearsOfExp: 5, technology: "React", resumeLink: "https://resume.com/sw", avatar: "https://reqres.in/img/faces/1-image.jpg"},
    {id: "JD002", name: "Michael Chen", yearsOfExp: 3, technology: "Node.js", resumeLink: "https://resume.com/mc", avatar: "https://reqres.in/img/faces/2-image.jpg"},
    {id: "JD003", name: "Emma Davis", yearsOfExp: 7, technology: "Python", resumeLink: "https://resume.com/ed", avatar: "https://reqres.in/img/faces/3-image.jpg"},
    {id: "JD004", name: "James Miller", yearsOfExp: 4, technology: "Java", resumeLink: "https://resume.com/jm", avatar: "https://reqres.in/img/faces/4-image.jpg"},
    {id: "JD005", name: "Lisa Anderson", yearsOfExp: 6, technology: "Full Stack", resumeLink: "https://resume.com/la", avatar: "https://reqres.in/img/faces/5-image.jpg"},
]

const TopSideButtons = ({onSubmitSelection}) => {
    return(
        <div className="inline-block float-right">
            <button className="btn px-6 btn-sm normal-case btn-primary" onClick={onSubmitSelection}>
                Add to List
            </button>
        </div>
    )
}

function Candidates(){
    const dispatch = useDispatch()
    const [candidates, setCandidates] = useState(INITIAL_CANDIDATES_LIST)
    const [selectedCandidates, setSelectedCandidates] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [listName, setListName] = useState("")

    const handleCheckboxChange = (candidateId) => {
        setSelectedCandidates(prev => {
            if (prev.includes(candidateId)) {
                return prev.filter(id => id !== candidateId)
            } else {
                return [...prev, candidateId]
            }
        })
    }

    const handleSubmitSelection = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/lists/add`, {
                candidateIds: selectedCandidates
            })
            
            dispatch(showNotification({
                message: `Successfully added ${selectedCandidates.length} candidates to list`,
                status: 1
            }))
            
            setSelectedCandidates([])
        } catch (error) {
            dispatch(showNotification({
                message: "Failed to add candidates to list",
                status: 0
            }))
        }
    }

    const addToList = () => {
        setIsModalOpen(true)
    }

    const handleSubmit = async () => {
        if (!listName.trim()) {
            dispatch(showNotification({message : "Please enter a list name", status : 0}))
            return
        }

        try {
            // Make API call here
            const response = await fetch('/api/lists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: listName,
                    candidateIds: selectedCandidates
                })
            })

            if (response.ok) {
                dispatch(showNotification({message : "List created successfully", status : 1}))
                setIsModalOpen(false)
                setListName("")
                setSelectedCandidates([])
            }
        } catch (error) {
            dispatch(showNotification({message : "Error creating list", status : 0}))
        }
    }

    return(
        <>
            <TitleCard title="Candidates List" topMargin="mt-2" TopSideButtons={<TopSideButtons onSubmitSelection={handleSubmitSelection}/>}>
                <div className="overflow-x-auto w-full">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Experience</th>
                                <th>Technology</th>
                                <th>Resume</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                candidates.map((candidate, k) => {
                                    return(
                                        <tr key={k}>
                                            <td>
                                                <input 
                                                    type="checkbox" 
                                                    className="checkbox checkbox-primary"
                                                    checked={selectedCandidates.includes(candidate.id)}
                                                    onChange={() => handleCheckboxChange(candidate.id)}
                                                />
                                            </td>
                                            <td>{candidate.id}</td>
                                            <td>
                                                <div className="flex items-center space-x-3">
                                                    <div className="avatar">
                                                        <div className="mask mask-squircle w-12 h-12">
                                                            <img src={candidate.avatar} alt="Avatar" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">{candidate.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{candidate.yearsOfExp} years</td>
                                            <td>
                                                <div className="badge badge-primary">{candidate.technology}</div>
                                            </td>
                                            <td>
                                                <a href={candidate.resumeLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-xs">
                                                    View Resume
                                                </a>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </TitleCard>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Create New List</h3>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">List Name</span>
                            </label>
                            <input 
                                type="text" 
                                value={listName}
                                onChange={(e) => setListName(e.target.value)}
                                placeholder="Enter list name" 
                                className="input input-bordered w-full" 
                            />
                        </div>
                        <div className="modal-action">
                            <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSubmit}>Create</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Candidates 