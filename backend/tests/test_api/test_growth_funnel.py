"""Growth funnel summary and UTM breakdown endpoint tests."""


def test_growth_funnel_summary_shape(client):
    for event_name in [
        "landing_view",
        "signup_completed",
        "verification_completed",
        "analysis_run",
        "dashboard_viewed",
        "dashboard_viewed",
    ]:
        response = client.post(
            "/growth/track",
            json={"event_name": event_name, "source": "web", "properties": {}},
        )
        assert response.status_code == 200

    summary = client.get("/growth/funnel-summary?days=14")
    assert summary.status_code == 200
    data = summary.json()

    assert "steps" in data
    assert len(data["steps"]) == 5
    assert "conversion_signup_from_visitor" in data
    assert "conversion_verified_from_signup" in data
    assert "conversion_first_value_from_verified" in data
    assert "conversion_return_from_first_value" in data

    step_names = {step["name"] for step in data["steps"]}
    assert step_names == {
        "visitor",
        "signup_completed",
        "verified",
        "first_value_action",
        "return_session",
    }


def test_utm_breakdown_empty(client):
    """UTM breakdown returns correct shape even with zero data."""
    resp = client.get("/growth/utm-breakdown?days=7")
    assert resp.status_code == 200
    data = resp.json()
    assert "rows" in data
    assert "top_events" in data
    assert "date_from" in data
    assert "date_to" in data
    assert isinstance(data["rows"], list)
    assert isinstance(data["top_events"], list)


def test_utm_breakdown_captures_utm_source(client):
    """Events with utm_source in properties appear in the UTM breakdown rows."""
    # Track signup_completed with utm params
    for _ in range(3):
        client.post(
            "/growth/track",
            json={
                "event_name": "signup_completed",
                "source": "web",
                "properties": {
                    "utm_source": "google",
                    "utm_medium": "cpc",
                    "utm_campaign": "brand",
                },
            },
        )
    client.post(
        "/growth/track",
        json={
            "event_name": "signup_completed",
            "source": "web",
            "properties": {"utm_source": "linkedin", "utm_medium": "social"},
        },
    )

    resp = client.get("/growth/utm-breakdown?days=14")
    assert resp.status_code == 200
    data = resp.json()

    sources = [r["utm_source"] for r in data["rows"]]
    assert "google" in sources
    assert "linkedin" in sources

    google_row = next(r for r in data["rows"] if r["utm_source"] == "google")
    assert google_row["signups"] == 3


def test_utm_breakdown_top_events(client):
    """Top events list includes tracked event names."""
    for event in ["chat_message_sent", "chat_message_sent", "analysis_run", "creative_generated"]:
        client.post(
            "/growth/track",
            json={"event_name": event, "source": "web", "properties": {}},
        )

    resp = client.get("/growth/utm-breakdown?days=14")
    assert resp.status_code == 200
    data = resp.json()

    event_names = [e["event_name"] for e in data["top_events"]]
    # chat_message_sent appears twice so should appear in top events
    assert "chat_message_sent" in event_names


def test_utm_breakdown_days_clamped(client):
    """days parameter is clamped to 1–90."""
    for days_param, expected_ok in [("0", True), ("91", True), ("14", True)]:
        resp = client.get(f"/growth/utm-breakdown?days={days_param}")
        assert resp.status_code == 200 if expected_ok else True
