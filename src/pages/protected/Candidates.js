import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import TitleCard from "../../components/Cards/TitleCard"
import { showNotification } from "../../features/common/headerSlice"
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const TopSideButtons = ({onAddToList}) => {
    const navigate = useNavigate()
    
    return(
        <div className="inline-block float-right">
            <button 
                className="btn px-6 btn-sm normal-case btn-secondary mr-2" 
                onClick={() => navigate('/app/candidates/add')}
            >
                Add Candidate
            </button>
            <button 
                className="btn px-6 btn-sm normal-case btn-primary" 
                onClick={onAddToList}
            >
                Add to List
            </button>
        </div>
    )
}

function InternalPage(){
    const dispatch = useDispatch()
    const [candidates, setCandidates] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCandidates, setSelectedCandidates] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [listName, setListName] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Candidates"}))
        fetchCandidates()
    }, [dispatch])

    const fetchCandidates = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/candidates`)
            if (!response.ok) {
                throw new Error('Failed to fetch candidates')
            }
            const data = await response.json()
            setCandidates(data)
            setLoading(false)
        } catch (error) {
            dispatch(showNotification({
                message: error.message || "Error fetching candidates",
                status: 0
            }))
            setLoading(false)
        }
    }

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
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/hotlists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: listName,
                    candidates: selectedCandidates // Array of candidate IDs
                })
            })

            if (response.ok) {
                dispatch(showNotification({
                    message: "List created successfully",
                    status: 1
                }))
                setIsModalOpen(false)
                setListName("")
                setSelectedCandidates([])
            } else {
                const error = await response.json()
                throw new Error(error.message || 'Failed to create list')
            }
        } catch (error) {
            dispatch(showNotification({
                message: error.message || "Error creating list",
                status: 0
            }))
        }
    }

    return(
        <>
            <TitleCard 
                title="Candidates List" 
                topMargin="mt-2" 
                TopSideButtons={<TopSideButtons onAddToList={addToList}/>}
            >
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto w-full">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Select</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Experience</th>
                                    <th>Technology</th>
                                    <th>Resume</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {candidates.map((candidate) => (
                                    <tr key={candidate._id}>
                                        <td>
                                            <input 
                                                type="checkbox" 
                                                className="checkbox checkbox-primary"
                                                checked={selectedCandidates.includes(candidate._id)}
                                                onChange={() => handleCheckboxChange(candidate._id)}
                                            />
                                        </td>
                                        <td>
                                            <div 
                                                className="flex items-center space-x-3 cursor-pointer hover:text-primary"
                                                onClick={() => navigate(`/app/candidates/${candidate._id}`)}
                                            >
                                                <div className="avatar">
                                                    <div className="mask mask-squircle w-12 h-12">
                                                        <img src={candidate.avatar || 'https://reqres.in/img/faces/1-image.jpg'} alt="Avatar" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold">{candidate.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{candidate.email}</td>
                                        <td>{candidate.yearsOfExp} years</td>
                                        <td>
                                            <div className="badge badge-primary">{candidate.technology}</div>
                                        </td>
                                        <td>
                                            {candidate.resumeFile && (
                                                <a 
                                                    href={`${process.env.REACT_APP_BASE_URL}/uploads/${candidate.resumeFile}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="btn btn-ghost btn-xs"
                                                >
                                                    View Resume
                                                </a>
                                            )}
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => navigate(`/app/candidates/${candidate._id}`)} 
                                                className="btn btn-ghost btn-xs"
                                            >
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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
                        <div className="mt-4">
                            <p className="text-sm text-gray-600">
                                Selected candidates: {selectedCandidates.length}
                            </p>
                        </div>
                        <div className="modal-action">
                            <button 
                                className="btn btn-ghost" 
                                onClick={() => {
                                    setIsModalOpen(false)
                                    setListName("")
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleSubmit}
                                disabled={!listName.trim() || selectedCandidates.length === 0}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default InternalPage