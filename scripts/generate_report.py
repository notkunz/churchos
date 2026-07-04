import os
import json
from datetime import datetime, date
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")
supabase: Client = create_client(url, key)

def get_monthly_summary(church_id: str, year: int, month: int) -> dict:
    first_day = date(year, month, 1).isoformat()
    if month == 12:
        last_day = date(year + 1, 1, 1).isoformat()
    else:
        last_day = date(year, month + 1, 1).isoformat()

    # Members
    members = supabase.table("members").select("id", count="exact").eq("church_id", church_id).eq("is_active", True).execute()

    # Attendance for the month
    attendance = supabase.table("attendance").select("present").eq("church_id", church_id).gte("service_date", first_day).lt("service_date", last_day).execute()

    total_services = len(set([
        r["service_date"] for r in
        supabase.table("attendance").select("service_date").eq("church_id", church_id).gte("service_date", first_day).lt("service_date", last_day).execute().data
    ]))

    present_count = sum(1 for r in attendance.data if r["present"])

    # Transactions
    transactions = supabase.table("transactions").select("type, amount").eq("church_id", church_id).gte("date", first_day).lt("date", last_day).execute()

    total_tithe = sum(float(r["amount"]) for r in transactions.data if r["type"] == "tithe")
    total_offering = sum(float(r["amount"]) for r in transactions.data if r["type"] == "offering")
    total_seed = sum(float(r["amount"]) for r in transactions.data if r["type"] == "seed")
    total_other = sum(float(r["amount"]) for r in transactions.data if r["type"] == "other")
    total_income = total_tithe + total_offering + total_seed + total_other

    summary = {
        "period": f"{date(year, month, 1).strftime('%B %Y')}",
        "total_active_members": members.count or 0,
        "total_services": total_services,
        "total_attendance_records": len(attendance.data),
        "total_present": present_count,
        "average_attendance": round(present_count / total_services, 1) if total_services > 0 else 0,
        "total_tithe": total_tithe,
        "total_offering": total_offering,
        "total_seed": total_seed,
        "total_other": total_other,
        "total_income": total_income,
        "generated_at": datetime.now().isoformat(),
    }

    return summary

def print_report(summary: dict) -> None:
    print("\n" + "=" * 40)
    print(f"  CHURCHOS MONTHLY REPORT — {summary['period']}")
    print("=" * 40)
    print(f"  Active Members       : {summary['total_active_members']}")
    print(f"  Services This Month  : {summary['total_services']}")
    print(f"  Avg Attendance       : {summary['average_attendance']} per service")
    print("-" * 40)
    print(f"  Tithe Collected      : ₦{summary['total_tithe']:,.2f}")
    print(f"  Offering Collected   : ₦{summary['total_offering']:,.2f}")
    print(f"  Seed/Other           : ₦{(summary['total_seed'] + summary['total_other']):,.2f}")
    print(f"  Total Income         : ₦{summary['total_income']:,.2f}")
    print("=" * 40)
    print(f"  Generated: {summary['generated_at']}")
    print()

def export_json(summary: dict, filename: str) -> None:
    with open(filename, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"Report exported to {filename}")

if __name__ == "__main__":
    church_id = input("Enter church ID: ").strip()
    now = datetime.now()
    year = int(input(f"Year [{now.year}]: ").strip() or now.year)
    month = int(input(f"Month [{now.month}]: ").strip() or now.month)

    summary = get_monthly_summary(church_id, year, month)
    print_report(summary)

    export = input("Export to JSON? (y/n): ").strip().lower()
    if export == "y":
        filename = f"report_{year}_{month:02d}.json"
        export_json(summary, filename)