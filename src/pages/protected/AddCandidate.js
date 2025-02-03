import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import TitleCard from "../../components/Cards/TitleCard"
import { showNotification } from "../../features/common/headerSlice"
import { useNavigate } from 'react-router-dom'

function AddCandidate(){
    const dispatch = useDispatch()
    const navigate = useNavigate()
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        yearsOfExp: '',
        technology: '',
        resumeFile: null,
        avatar: ''
    })

    useEffect(() => {
        dispatch(setPageTitle({ title : "Add Candidate"}))
    }, [dispatch])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleResumeUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFormData(prev => ({
                ...prev,
                resumeFile: file
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        try {
            const formDataToSend = new FormData()
            formDataToSend.append('name', formData.name)
            formDataToSend.append('email', formData.email)
            formDataToSend.append('yearsOfExp', formData.yearsOfExp)
            formDataToSend.append('technology', formData.technology)
            formDataToSend.append('avatar', formData.avatar)
            
            // Only append file if it exists
            if (formData.resumeFile) {
                formDataToSend.append('resumeFile', formData.resumeFile)
            }

            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/candidate/with-resume`, {
                method: 'POST',
                body: formDataToSend
            })

            if (response.ok) {
                dispatch(showNotification({
                    message: "Candidate added successfully",
                    status: 1
                }))
                navigate('/app/candidates')
            } else {
                const error = await response.json()
                throw new Error(error.message || 'Failed to add candidate')
            }
        } catch (error) {
            dispatch(showNotification({
                message: error.message || "Error adding candidate",
                status: 0
            }))
        }
    }

    return(
        <>
            <TitleCard title="Add New Candidate" topMargin="mt-2">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Name</span>
                            </label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="input input-bordered"
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="input input-bordered"
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Years of Experience</span>
                            </label>
                            <input 
                                type="number" 
                                name="yearsOfExp"
                                value={formData.yearsOfExp}
                                onChange={handleInputChange}
                                className="input input-bordered"
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Technology</span>
                            </label>
                            <select 
                                name="technology"
                                value={formData.technology}
                                onChange={handleInputChange}
                                className="select select-bordered"
                                required
                            >
                                <option value="">Select Technology</option>
                                <option value="React">React</option>
                                <option value="Node.js">Node.js</option>
                                <option value="Python">Python</option>
                                <option value="Java">Java</option>
                                <option value="Full Stack">Full Stack</option>
                            </select>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Resume</span>
                            </label>
                            <input 
                                type="file" 
                                accept=".pdf,.doc,.docx"
                                onChange={handleResumeUpload}
                                className="file-input file-input-bordered w-full"
                                required
                            />
                            <label className="label">
                                <span className="label-text-alt">Upload resume to auto-fill form</span>
                            </label>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Profile Picture URL</span>
                            </label>
                            <input 
                                type="url" 
                                name="avatar"
                                value={formData.avatar}
                                onChange={handleInputChange}
                                className="input input-bordered"
                                placeholder="https://example.com/avatar.jpg"
                            />
                        </div>
                    </div>

                    <div className="mt-16">
                        <button type="button" onClick={() => navigate('/app/candidates')} className="btn btn-ghost mr-2">Cancel</button>
                        <button type="submit" className="btn btn-primary">Add Candidate</button>
                    </div>
                </form>
            </TitleCard>
        </>
    )
}

export default AddCandidate 