interface ProfileCardProps {
    label: string;
    value: string;
}

function ProfileCard({ label, value }: ProfileCardProps) {
    return (
        <div className="col-md-4 mb-2">
            <div className="metric-card">
                <h6 className="metric-label">{label}</h6>
                <p
                    className={`metric-value ${
                        value === "Active" ? "metric-value-active" : ""
                    }`}
                >
                    {value}
                </p>
            </div>
        </div>
    );
}

export default ProfileCard;