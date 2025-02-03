import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import TitleCard from "../../components/Cards/TitleCard"
import { showNotification } from "../../features/common/headerSlice"
import { useNavigate } from 'react-router-dom'

function Jobs() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const limit = 10

    useEffect(() => {
        dispatch(setPageTitle({ title: "Jobs" }))
        fetchJobs(currentPage)
    }, [dispatch, currentPage])

    const fetchJobs = async (page) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/jobs?page=${page}&limit=${limit}`)
            if (!response.ok) {
                throw new Error('Failed to fetch jobs')
            }
            const data = await response.json()
            console.log(data.data.jobs)
            setJobs(data.data.jobs.map(job => ({
                ...job,
                views: job.views || 0
            })))
            // Assuming we have 50 total jobs for now, can be updated when API provides total count
            setTotalPages(Math.ceil(data.total / limit))
            setLoading(false)
        } catch (error) {
            dispatch(showNotification({
                message: error.message || "Error fetching jobs",
                status: 0
            }))
            setLoading(false)
        }
    }

    const getStatusBadge = (status, isNew) => {
        let className = "badge "
        switch(status.toLowerCase()) {
            case 'active':
                className += "badge-success"
                break
            case 'pending':
                className += "badge-warning"
                break
            case 'closed':
                className += "badge-error"
                break
            default:
                className += "badge-info"
        }
        return (
            <div className="flex items-center gap-2">
                <span className={className}>{status}</span>
                {isNew && <span className="badge badge-secondary">NEW</span>}
            </div>
        )
    }

    const formatSalary = (salary) => {
        if (!salary) return 'Not Specified'
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: salary.currency,
            maximumFractionDigits: 0
        })
        return `${formatter.format(salary.min)} - ${formatter.format(salary.max)} ${salary.period}`
    }

    const Pagination = () => {
        if (totalPages <= 1) return null;

        const getPageNumbers = () => {
            const delta = 2;
            const range = [];
            for (
                let i = Math.max(2, currentPage - delta);
                i <= Math.min(totalPages - 1, currentPage + delta);
                i++
            ) {
                range.push(i);
            }

            if (currentPage - delta > 2) {
                range.unshift('...');
            }
            if (currentPage + delta < totalPages - 1) {
                range.push('...');
            }

            range.unshift(1);
            if (totalPages !== 1) {
                range.push(totalPages);
            }

            return range;
        };

        return (
            <div className="flex justify-center space-x-1 mt-4">
                <button 
                    className="btn btn-sm btn-ghost"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                >
                    «
                </button>
                
                {getPageNumbers().map((pageNum, index) => (
                    pageNum === '...' ? (
                        <span key={`ellipsis-${index}`} className="btn btn-sm btn-ghost no-animation cursor-default">
                            ...
                        </span>
                    ) : (
                        <button
                            key={`page-${pageNum}`}
                            className={`btn btn-sm ${currentPage === pageNum ? 'btn-active' : 'btn-ghost'}`}
                            onClick={() => setCurrentPage(pageNum)}
                        >
                            {pageNum}
                        </button>
                    )
                ))}

                <button 
                    className="btn btn-sm btn-ghost"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                >
                    »
                </button>
            </div>
        );
    };

    return (
        <>
            <TitleCard 
                title="Jobs" 
                topMargin="mt-2"
                TopSideButtons={
                    <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate('/app/jobs/add')}
                    >
                        Add New Job
                    </button>
                }
            >
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Job Details</th>
                                        <th>Company</th>
                                        <th>Skills & Experience</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                        <th>Applications</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobs.map((job) => (
                                        <tr key={job._id} className={
                                            new Date(job.postedDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
                                            ? 'bg-base-200' 
                                            : ''
                                        }>
                                            <td>
                                                <div 
                                                    className="cursor-pointer hover:text-primary"
                                                    onClick={() => navigate(`/app/jobs/${job._id}`)}
                                                >
                                                    <div className="font-bold">{job.title}</div>
                                                    <div className="text-sm opacity-50">
                                                        Posted: {new Date(job.postedDate).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-sm text-primary">
                                                        {formatSalary(job.salary)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center space-x-3">
                                                    <div className="avatar">
                                                        <div className="mask mask-squircle w-12 h-12">
                                                            <img src={job.company.logo} alt={job.company.name} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">{job.company.name}</div>
                                                        <div className="text-sm opacity-50">
                                                            <a href={job.company.website} 
                                                               target="_blank" 
                                                               rel="noopener noreferrer"
                                                               className="link link-hover">
                                                                Website
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="badge badge-primary mb-2">
                                                    {job.primaryTechnology}
                                                </div>
                                                <div className="text-sm">{job.experienceLevel}</div>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {job.requiredSkills.slice(0, 3).map((skill, index) => (
                                                        <span key={index} className="badge badge-ghost badge-sm">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {job.requiredSkills.length > 3 && (
                                                        <span className="badge badge-ghost badge-sm">
                                                            +{job.requiredSkills.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="font-medium">{job.location}</div>
                                                {job.remote && (
                                                    <div className="badge badge-ghost">Remote</div>
                                                )}
                                                <div className="text-sm opacity-50">{job.jobType}</div>
                                            </td>
                                            <td>{getStatusBadge(job.status)}</td>
                                            <td>
                                                <div className="text-center">
                                                    <div className="font-bold">{job.applications}</div>
                                                    <div className="text-xs opacity-50">
                                                        {job.views} views
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        className="btn btn-ghost btn-xs"
                                                        onClick={() => navigate(`/app/jobs/${job._id}`)}
                                                    >
                                                        View
                                                    </button>
                                                    <button 
                                                        className="btn btn-primary btn-xs"
                                                        onClick={() => navigate(`/app/jobs/${job._id}/submit`)}
                                                    >
                                                        Submit
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination />
                    </>
                )}
            </TitleCard>
        </>
    )
}

export default Jobs 