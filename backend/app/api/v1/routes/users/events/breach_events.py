from datetime import datetime
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from app.models.user.events.event import BreachEvent
from app.services.users.events.breach_event_service import BreachEventService
from app.utils.logger.logger import Logger

class ResolutionRequest(BaseModel):
    notes: str = ''

class ManualBreachEvent(BaseModel):
    user_id: str
    breach_type: str
    effect_score: int
    description: str
    severity: str
    status: str

router = APIRouter(
    prefix="/breach-events",
    tags=["breach-events"],
    responses={
        404: {"description": "Not found"},
        500: {"description": "Internal server error"}
    }
)

@router.get("/",
         response_model=dict,
         summary="Get all breach events",
         description="Retrieve all breach events.")
async def get_all_breach_events():
    try:
        events = await BreachEventService.get_all_breach_events()
        return {"status": "success", "data": events or []}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        Logger.error(f"Error getting all events: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/manual",
          response_model=dict,
          summary="Manually create a new breach event",
          description="Create a new breach event manually from the dashboard")
async def create_manual_breach_event(event: ManualBreachEvent):
    try:
        Logger.info(f"Creating manual breach event: {event}")
        event_dict = event.model_dump()
        event_dict['timestamp'] = datetime.utcnow()
        event_dict['manual_entry'] = True

        created_event = await BreachEventService.create_breach_event(event_dict)
        if not created_event:
            raise HTTPException(status_code=500, detail="Failed to create breach event")

        return {"status": "success", "data": created_event}
    except Exception as e:
        Logger.error(f"Error creating manual breach event: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/",
          response_model=dict,
          summary="Create a new breach event",
          description="""Create a new breach event with the given details.

          The breach event will be associated with a user and company, and will track:
          * Breach type (e.g., suspicious activity, fraud)
          * Severity level
          * Description of the breach
          * Resolution status and notes

          Returns the created breach event.
          """)
async def create_breach_event(event: BreachEvent):
    try:
        created_event = await BreachEventService.create_breach_event(event)
        if not created_event:
            raise HTTPException(status_code=400, detail="Failed to create breach event")
        return {"status": "success", "data": created_event}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        Logger.error(f"Error creating breach event: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/unresolved",
         response_model=dict,
         summary="Get all unresolved breach events",
         description="Retrieve all breach events that have not been resolved.")
async def get_unresolved_events():
    try:
        events = await BreachEventService.get_unresolved_events()
        return {"status": "success", "data": events or []}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        Logger.error(f"Error getting unresolved events: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{event_id}",
         response_model=dict,
         summary="Get a breach event by ID",
         description="""Retrieve a specific breach event by its ID.

         Returns the breach event details including:
         * User and company information
         * Breach type and severity
         * Description and timestamps
         * Resolution status
         """)
async def get_breach_event(event_id: str):
    try:
        event = await BreachEventService.get_breach_event(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Breach event not found")
        return {"status": "success", "data": event}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        Logger.error(f"Error getting breach event: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}",
         response_model=dict,
         summary="Get all breach events for a user",
         description="""Retrieve all breach events associated with a specific user.

         Returns a list of breach events, each containing:
         * Breach details and type
         * Company information
         * Severity and status
         * Resolution information
         """)
async def get_user_breach_events(user_id: str):
    try:
        events = await BreachEventService.get_user_breach_events(user_id)
        if not events:
            return {"status": "success", "data": []}
        return {"status": "success", "data": events}
    except Exception as e:
        Logger.error(f"Error getting user breach events: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/company/{company_id}",
         response_model=dict,
         summary="Get all breach events for a company",
         description="Retrieve all breach events associated with a specific company.")
async def get_company_breach_events(company_id: str):
    try:
        events = await BreachEventService.get_company_breach_events(company_id)
        if not events:
            return {"status": "success", "data": []}
        return {"status": "success", "data": events}
    except Exception as e:
        Logger.error(f"Error getting company breach events: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{event_id}",
         response_model=dict,
         summary="Update a breach event",
         description="Update an existing breach event with new information.")
async def update_breach_event(event_id: str, event: BreachEvent):
    try:
        updated_event = await BreachEventService.update_breach_event(event_id, event)
        if not updated_event:
            raise HTTPException(status_code=404, detail="Breach event not found")
        return {"status": "success", "data": updated_event}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        Logger.error(f"Error updating breach event: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{event_id}",
            response_model=dict,
            summary="Delete a breach event",
            description="Delete an existing breach event.")
async def delete_breach_event(event_id: str):
    try:
        success = await BreachEventService.delete_breach_event(event_id)
        if not success:
            raise HTTPException(status_code=404, detail="Breach event not found")
        return {"status": "success", "message": "Breach event deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        Logger.error(f"Error deleting breach event: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{event_id}/resolve")
async def resolve_breach_event(event_id: str):
    resolved = await BreachEventService.resolve(event_id, '')
    if not resolved:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"status": "success", "data": resolved}

@router.get("/unresolved",
         response_model=dict,
         summary="Get all unresolved breach events",
         description="Retrieve all breach events that have not been resolved.")
async def get_unresolved_events():
    try:
        events = await BreachEventService.get_unresolved_events()
        return {"status": "success", "data": events or []}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        Logger.error(f"Error getting unresolved events: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
