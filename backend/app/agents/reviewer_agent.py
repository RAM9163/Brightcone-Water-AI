from typing import Dict, Any


def reviewer_agent(
    maintenance_plan: list,
    operations: list
) -> Dict[str, Any]:
    """
    Reviewer/Critic Agent.

    Reviews AI-generated maintenance and operations recommendations
    before human approval.
    """

    reviews = []

    for item in maintenance_plan:
        dma_id = item.get("dma_id")
        priority_score = float(item.get("priority_score", 0))
        water_loss = float(item.get("water_loss_percentage", 0))
        leak_score = float(item.get("leak_evidence_score", 0))

        issues = []
        evidence = []

        if priority_score >= 75:
            evidence.append("High maintenance priority score")

        if water_loss >= 20:
            evidence.append("High water-loss percentage")

        if leak_score >= 25:
            evidence.append("Strong leak evidence")

        if not evidence:
            issues.append(
                "Recommendation has limited supporting evidence."
            )

        if issues:
            review_status = "Needs Review"
            recommendation = "Request additional evidence before approval."
        else:
            review_status = "Reviewed"
            recommendation = (
                "Recommendation is supported by available network evidence; "
                "human approval is still required."
            )

        reviews.append(
            {
                "dma_id": dma_id,
                "review_status": review_status,
                "evidence": evidence,
                "issues": issues,
                "reviewer_recommendation": recommendation,
                "human_approval_required": True,
            }
        )

    return {
        "reviewer": "Reviewer/Critic Agent",
        "total_reviews": len(reviews),
        "data": reviews,
    }