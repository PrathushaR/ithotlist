import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { setPageTitle } from '../../features/common/headerSlice'
import TitleCard from "../../components/Cards/TitleCard"
import { showNotification } from "../../features/common/headerSlice"

function ListDetails() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { id } = useParams()
    const [list, setList] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        dispatch(setPageTitle({ title: "List Details" }))
        fetchListDetails()
    }, [dispatch, id])

    const fetchListDetails = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/hotlist/${id}`)
            if (!response.ok) {
                throw new Error('Failed to fetch list details')
            }
            const data = await response.json()
            setList(data)
            setLoading(false)
        } catch (error) {
            dispatch(showNotification({
                message: error.message || "Error fetching list details",
                status: 0
            }))
            setLoading(false)
        }
    }

    if (loading) return <div className="flex items-center justify-center h-48">Loading...</div>
    if (!list) return <div className="flex items-center justify-center h-48">List not found</div>

    return (
        <>
            <div className="flex justify-between items-center">
                <button onClick={() => navigate('/app/lists')} className="btn btn-ghost">
                    ← Back to Lists
                </button>
            </div>

            <TitleCard title={`List: ${list.name}`} topMargin="mt-2">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Experience</th>
                                <th>Technology</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.candidates.map((candidate) => (
                                <tr key={candidate._id}>
                                    <td>
                                        <div className="flex items-center space-x-3">
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
            </TitleCard>
        </>
    )
}

export default ListDetails 