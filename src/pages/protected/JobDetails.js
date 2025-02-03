import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { setPageTitle } from '../../features/common/headerSlice'
import TitleCard from "../../components/Cards/TitleCard"
import { showNotification } from "../../features/common/headerSlice"
import { 
    BriefcaseIcon, 
    BuildingOfficeIcon,
    MapPinIcon,
    CurrencyDollarIcon,
    ClockIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline'
import debounce from 'lodash.debounce'

function JobDetails() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { id } = useParams()
    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [submissionType, setSubmissionType] = useState('candidate')
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [selectedItem, setSelectedItem] = useState(null)
    const [searching, setSearching] = useState(false)
    const searchInputRef = useRef(null)

    useEffect(() => {
        dispatch(setPageTitle({ title: "Job Details" }))
        fetchJobDetails()
    }, [dispatch, id])

    // Replace the existing debouncedSearch with this optimized version
    const debouncedSearch = useMemo(
        () => debounce(async (value) => {
            if (!value || value.length < 2) {
                setSearchResults([]);
                return;
            }

            setSearching(true);
            try {
                const endpoint = submissionType === 'candidate' 
                    ? '/api/candidates/search' 
                    : '/api/hotlists/search';
                
                const response = await fetch(
                    `${process.env.REACT_APP_BASE_URL}${endpoint}?q=${value}`
                );
                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 300), // Reduced debounce time
        [submissionType] // Add submissionType as dependency
    );

    // Update handleSearchInput
    const handleSearchInput = useCallback((e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    }, [debouncedSearch]);

    // Add focus handling
    const handleSearchFocus = useCallback((e) => {
        // Prevent the dropdown from closing when selecting an item
        e.target.setAttribute('autocomplete', 'off');
    }, []);

    // Handle item selection
    const handleItemSelect = (item) => {
        setSelectedItem(item);
        setSearchTerm(submissionType === 'candidate' ? item.name : item.title);
        setSearchResults([]);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    const fetchJobDetails = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/jobs/${id}`)
            if (!response.ok) throw new Error('Failed to fetch job details')
            const data = await response.json()
            setJob(data.data)
            setLoading(false)
        } catch (error) {
            dispatch(showNotification({
                message: error.message,
                status: 0
            }))
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!selectedItem) return

        try {
            const payload = {
                jobId: id,
                [submissionType === 'candidate' ? 'candidateId' : 'hotlistId']: selectedItem._id
            }

            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/jobs/${id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error('Submission failed')

            dispatch(showNotification({
                message: "Successfully submitted",
                status: 1
            }))
            setIsModalOpen(false)
            setSelectedItem(null)
            setSearchTerm('')
        } catch (error) {
            dispatch(showNotification({
                message: error.message,
                status: 0
            }))
        }
    }

    const SubmissionModal = () => (
        <div className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
            <div className="modal-box">
                <h3 className="font-bold text-lg">Submit for {job?.title}</h3>
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Submission Type</span>
                    </label>
                    <select 
                        className="select select-bordered"
                        value={submissionType}
                        onChange={(e) => {
                            setSubmissionType(e.target.value);
                            setSearchTerm('');
                            setSelectedItem(null);
                            setSearchResults([]);
                        }}
                    >
                        <option value="candidate">Candidate</option>
                        <option value="hotlist">Hotlist</option>
                    </select>

                    <div className="form-control mt-4">
                        <label className="label">
                            <span className="label-text">
                                Search {submissionType === 'candidate' ? 'Candidates' : 'Hotlists'}
                            </span>
                        </label>
                        <div className="dropdown w-full">
                            <input 
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="Start typing to search..."
                                value={searchTerm}
                                onChange={handleSearchInput}
                                ref={searchInputRef}
                                autoComplete="off"
                            />
                            
                            {searching && (
                                <div className="absolute right-3 top-3 text-sm text-gray-500">
                                    Searching...
                                </div>
                            )}

                            {searchResults.length > 0 && !searching && (
                                <div className="dropdown-content bg-base-200 top-full w-full mt-1 max-h-60 overflow-auto rounded-box shadow-lg">
                                    <ul className="menu menu-compact">
                                        {searchResults.map((item) => (
                                            <li key={item._id}>
                                                <button
                                                    type="button"
                                                    className={`w-full text-left ${selectedItem?._id === item._id ? 'active' : ''}`}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        handleItemSelect(item);
                                                    }}
                                                >
                                                    {submissionType === 'candidate' ? item.name : item.title}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-action">
                    <button 
                        className="btn btn-ghost" 
                        onClick={() => {
                            setIsModalOpen(false);
                            setSelectedItem(null);
                            setSearchTerm('');
                            setSearchResults([]);
                        }}
                    >
                        Cancel
                    </button>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleSubmit}
                        disabled={!selectedItem}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    )

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
    if (!job) return <div className="flex items-center justify-center h-screen">Job not found</div>

    return (
        <>
            <div className="flex justify-between items-center">
                <button onClick={() => navigate('/app/jobs')} className="btn btn-ghost">
                    ← Back to Jobs
                </button>
                <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="btn btn-primary"
                >
                    Submit Candidate/List
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2">
                    <TitleCard title="Job Details">
                        <h2 className="text-2xl font-bold mb-4">{job.title}</h2>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <BuildingOfficeIcon className="w-5 h-5 text-primary"/>
                                <span>{job.company.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPinIcon className="w-5 h-5 text-primary"/>
                                <span>{job.location} {job.remote && '(Remote)'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CurrencyDollarIcon className="w-5 h-5 text-primary"/>
                                <span>{job.salary.min} - {job.salary.max} {job.salary.currency}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ClockIcon className="w-5 h-5 text-primary"/>
                                <span>{job.jobType}</span>
                            </div>
                        </div>

                        <div className="prose max-w-none">
                            <h3>Description</h3>
                            <p>{job.description}</p>

                            <h3>Requirements</h3>
                            <ul>
                                {job.requirements.map((req, index) => (
                                    <li key={index}>{req}</li>
                                ))}
                            </ul>

                            <h3>Responsibilities</h3>
                            <ul>
                                {job.responsibilities.map((resp, index) => (
                                    <li key={index}>{resp}</li>
                                ))}
                            </ul>
                        </div>
                    </TitleCard>
                </div>

                <div>
                    <TitleCard title="Overview">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold">Experience Level</label>
                                <p>{job.experienceLevel}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold">Primary Technology</label>
                                <p>{job.primaryTechnology}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold">Required Skills</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {job.requiredSkills.map((skill, index) => (
                                        <span key={index} className="badge badge-outline">{skill}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold">Benefits</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {job.benefits.map((benefit, index) => (
                                        <span key={index} className="badge badge-primary">{benefit}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TitleCard>
                </div>
            </div>

            <SubmissionModal />
        </>
    )
}

export default JobDetails 