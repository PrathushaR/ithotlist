import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import TitleCard from "../../components/Cards/TitleCard"
import { showNotification } from "../../features/common/headerSlice"
import { useNavigate } from 'react-router-dom'

function Lists() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [lists, setLists] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        dispatch(setPageTitle({ title: "Candidate Lists" }))
        fetchLists()
    }, [dispatch])

    const fetchLists = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/hotlists`)
            if (!response.ok) {
                throw new Error('Failed to fetch lists')
            }
            const data = await response.json()
            setLists(data)
            setLoading(false)
        } catch (error) {
            dispatch(showNotification({
                message: error.message || "Error fetching lists",
                status: 0
            }))
            setLoading(false)
        }
    }

    return (
        <>
            <TitleCard title="Candidate Lists" topMargin="mt-2">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>List Name</th>
                                    <th>Candidates Count</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lists.map((list) => (
                                    <tr key={list._id}>
                                        <td>{list.name}</td>
                                        <td>{list.candidates?.length || 0}</td>
                                        <td>{new Date(list.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button 
                                                onClick={() => navigate(`/app/lists/${list._id}`)}
                                                className="btn btn-ghost btn-xs"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </TitleCard>
        </>
    )
}

export default Lists 