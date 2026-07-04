import os
import csv
from datetime import datetime
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

def export_attendance(church_id: str, output_file: str = "attendance_report.csv"):
    data = supabase.table("attendance").select(
        "service_date, present, members(full_name, department)"
    ).eq("church_id", church_id).execute()

    with open(output_file, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Name", "Department", "Date", "Present"])
        for row in data.data:
            member = row.get("members") or {}
            writer.writerow([
                member.get("full_name", ""),
                member.get("department", ""),
                row["service_date"],
                "Yes" if row["present"] else "No"
            ])
    print(f"Report saved to {output_file}")

def export_transactions(church_id: str, output_file: str = "transactions_report.csv"):
    data = supabase.table("transactions").select(
        "date, type, amount, note, members(full_name)"
    ).eq("church_id", church_id).execute()

    with open(output_file, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Name", "Type", "Amount", "Date", "Note"])
        for row in data.data:
            member = row.get("members") or {}
            writer.writerow([
                member.get("full_name", ""),
                row["type"],
                row["amount"],
                row["date"],
                row.get("note", "")
            ])
    print(f"Report saved to {output_file}")

if __name__ == "__main__":
    church_id = input("Enter church ID: ")
    print("1. Attendance Report")
    print("2. Transaction Report")
    choice = input("Choose: ")
    if choice == "1":
        export_attendance(church_id)
    elif choice == "2":
        export_transactions(church_id)