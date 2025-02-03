import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import TitleCard from "../../components/Cards/TitleCard"
import { useNavigate } from 'react-router-dom'
import { 
    DocumentTextIcon, 
    UserGroupIcon, 
    ListBulletIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline'

function Dashboard(){
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        totalCandidates: 0,
        totalLists: 0,
        pendingDocuments: 0,
        newJobs: 0
    })
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        dispatch(setPageTitle({ title : "Dashboard"}))
        fetchDashboardData()
    }, [dispatch])

    const fetchDashboardData = async () => {
        try {
            // Fetch stats
            const statsResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/api/dashboard/stats`)
            const statsData = await statsResponse.json()
            setStats(statsData)

            // Fetch notifications
            const notificationsResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/api/notifications`)
            const notificationsData = await notificationsResponse.json()
            setNotifications(notificationsData)

            setLoading(false)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            setLoading(false)
        }
    }

    // Quick action cards
    const QuickActions = () => {
        const actions = [
            {
                title: "Candidates",
                icon: <UserGroupIcon className="w-8 h-8"/>,
                value: stats.totalCandidates,
                link: "/app/candidates"
            },
            {
                title: "Lists",
                icon: <ListBulletIcon className="w-8 h-8"/>,
                value: stats.totalLists,
                link: "/app/lists"
            },
            {
                title: "Pending Documents",
                icon: <DocumentTextIcon className="w-8 h-8"/>,
                value: stats.pendingDocuments,
                link: "/app/candidates"
            },
            {
                title: "New Jobs",
                icon: <BriefcaseIcon className="w-8 h-8"/>,
                value: stats.newJobs,
                link: "/app/jobs"
            }
        ]

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {actions.map((action, index) => (
                    <div 
                        key={index}
                        className="stats shadow cursor-pointer hover:shadow-lg transition-all duration-200"
                        onClick={() => navigate(action.link)}
                    >
                        <div className="stat">
                            <div className="stat-figure text-primary">
                                {action.icon}
                            </div>
                            <div className="stat-title">{action.title}</div>
                            <div className="stat-value text-primary">{action.value}</div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    // Notification component
    const NotificationItem = ({ notification }) => {
        const getIcon = (type) => {
            switch(type) {
                case 'DOCUMENT_REQUEST':
                    return <DocumentTextIcon className="w-6 h-6 text-blue-500"/>
                case 'VERIFICATION':
                    return <UserGroupIcon className="w-6 h-6 text-green-500"/>
                case 'NEW_JOB':
                    return <BriefcaseIcon className="w-6 h-6 text-purple-500"/>
                default:
                    return null
            }
        }

        return (
            <div className="flex items-start space-x-4 p-4 hover:bg-base-200 rounded-lg">
                <div className="flex-shrink-0">
                    {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-gray-500">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
        )
    }

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    return (
        <>
            {/* Quick Stats */}
            <div className="mb-8">
                <QuickActions />
            </div>

            {/* Recent Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TitleCard title="Recent Notifications" topMargin="mt-2">
                    <div className="divide-y">
                        {notifications.map((notification, index) => (
                            <NotificationItem key={index} notification={notification} />
                        ))}
                    </div>
                </TitleCard>

                {/* Recent Lists */}
                <TitleCard title="Recent Lists" topMargin="mt-2">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>List Name</th>
                                    <th>Candidates</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentLists?.map((list, index) => (
                                    <tr key={index}>
                                        <td>{list.name}</td>
                                        <td>{list.candidateCount}</td>
                                        <td>
                                            <button 
                                                onClick={() => navigate(`/app/lists/${list._id}`)}
                                                className="btn btn-ghost btn-xs"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TitleCard>
            </div>
        </>
    )
}

export default Dashboard