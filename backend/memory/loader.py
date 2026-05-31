from db.client import get_founder, get_memory, get_recent_sessions


def load_founder_context(founder_id: str) -> str:
    founder = get_founder(founder_id)
    if not founder:
        return ""

    digest = get_memory(founder_id)
    sessions = get_recent_sessions(founder_id)

    context = f"""
=== FOUNDER PROFILE ===
Name:          {founder.get('name', 'Unknown')}
Building:      {founder.get('startup', 'Unknown')}
Idea:          {founder.get('idea', 'Not specified')}
Stage:         {founder.get('stage', 'Unknown')}
ICP:           {founder.get('icp', 'Not specified')}
Biggest fear:  {founder.get('biggest_fear', 'Not specified')}
Current focus: {founder.get('current_focus', 'Not specified')}
Constraints:   {founder.get('constraints', 'Not specified')}
"""

    if digest:
        context += f"\n=== JOURNEY SO FAR ===\n{digest}\n"

    if sessions:
        context += "\n=== RECENT SESSIONS ==="
        for i, s in enumerate(sessions):
            context += f"""

Session {i + 1}:
{s.get('summary', '')}
Decisions: {s.get('key_decisions', '')}
Action items: {s.get('action_items', '')}
"""

    return context
