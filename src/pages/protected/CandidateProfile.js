import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { setPageTitle } from '../../features/common/headerSlice'
import TitleCard from "../../components/Cards/TitleCard"
import { showNotification } from "../../features/common/headerSlice"

function CandidateProfile() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { id } = useParams()
    const [candidate, setCandidate] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        dispatch(setPageTitle({ title: "Candidate Profile" }))
        fetchCandidateDetails()
    }, [dispatch, id])

    const fetchCandidateDetails = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/candidates/${id}`)
            if (!response.ok) {
                throw new Error('Failed to fetch candidate details')
            }
            const data = await response.json()
            setCandidate(data)
            setLoading(false)
        } catch (error) {
            dispatch(showNotification({
                message: error.message || "Error fetching candidate details",
                status: 0
            }))
            setLoading(false)
        }
    }

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
    if (!candidate) return <div className="flex items-center justify-center h-screen">Candidate not found</div>

    return (
        <>
            <div className="flex justify-between items-center">
                <button onClick={() => navigate('/app/candidates')} className="btn btn-ghost">
                    ← Back to Candidates
                </button>
                <button onClick={() => navigate(`/app/candidates/edit/${id}`)} className="btn btn-primary">
                    Edit Profile
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                {/* Profile Overview */}
                <TitleCard title="Profile Overview">
                    <div className="flex flex-col items-center">
                        <div className="avatar mb-4">
                            <div className="w-24 rounded-full ring ring-primary">
                                <img src={candidate.avatar} alt={candidate.name} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold">{candidate.name}</h2>
                        <p className="text-gray-500">{candidate.currentRole}</p>
                        <div className="badge badge-primary mt-2">{candidate.technology}</div>
                    </div>
                </TitleCard>

                {/* Contact Information */}
                <TitleCard title="Contact Information">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold">Email</label>
                            <p>{candidate.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Phone</label>
                            <p>{candidate.phone}</p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Location</label>
                            <p>{candidate.location}</p>
                        </div>
                    </div>
                </TitleCard>

                {/* Professional Details */}
                <TitleCard title="Professional Details">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold">Experience</label>
                            <p>{candidate.yearsOfExp} years</p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Education</label>
                            <p>{candidate.education}</p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Availability</label>
                            <p>{candidate.availability}</p>
                        </div>
                    </div>
                </TitleCard>
            </div>

            {/* Skills Section */}
            <TitleCard title="Skills" topMargin="mt-6">
                <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, index) => (
                        <div key={index} className="badge badge-outline">{skill}</div>
                    ))}
                </div>
            </TitleCard>

            {/* Resume Section */}
            <TitleCard title="Documents" topMargin="mt-6">
                <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                    <span>Resume</span>
                    <a 
                        href={candidate.resumeLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-primary btn-sm"
                    >
                        View Resume
                    </a>
                </div>
            </TitleCard>
        </>
    )
}

export default CandidateProfile 