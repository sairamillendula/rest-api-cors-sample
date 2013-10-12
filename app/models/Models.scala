package models

case class Account(id: Long, zNumber: String, name: String)

object Account {
  private val dummyDB = Map(
      1L -> Account(1L, "A00000001", "Leo"),
      2L -> Account(2L, "A00000002", "Jenny"),
      3L -> Account(3L, "A00000003", "Tommy")
  )

  def findById(id: Long): Option[Account] = dummyDB.get(id)
}