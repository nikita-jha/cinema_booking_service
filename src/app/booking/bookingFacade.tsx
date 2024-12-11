// application/facade/BookingFacade.ts

export class BookingFacade {
    private showController: ShowController;
    private userController: UserController;
    private promotionController: PromotionController;
  
    constructor(
      showController = new ShowController(),
      userController = new UserController(),
      promotionController = new PromotionController()
    ) {
      this.showController = showController;
      this.userController = userController;
      this.promotionController = promotionController;
    }
  
    async fetchBookingDetails(userId: string, showId: string) {
      console.log("Fetching booking details...");
  
      const [user, show, promotions] = await Promise.all([
        this.userController.fetchUserDetails(userId),
        this.showController.fetchShowDetails(showId),
        this.promotionController.fetchAllPromotions(),
      ]);
  
      if (!user) throw new Error("User not found.");
      if (!show) throw new Error("Show not found.");
  
      return { user, show, promotions };
    }
  
    async reserveSeats(userId: string, showId: string, seats: number[]) {
      console.log("Reserving seats...");
  
      const unavailableSeats = await this.showController.validateSeatAvailability(showId, seats);
      if (unavailableSeats.length > 0) {
        throw new Error(`Seats ${unavailableSeats.join(", ")} are already reserved.`);
      }
  
      await this.showController.bookSeats(showId, seats, userId);
      console.log(`Reserved seats ${seats.join(", ")} for user ${userId} in show ${showId}.`);
  
      return { success: true, message: "Seats reserved successfully." };
    }
  
    async applyPromotion(promoCode: string) {
      console.log("Applying promotion...");
  
      const promotion = await this.promotionController.validatePromoCode(promoCode);
      if (!promotion) throw new Error("Invalid or expired promotion code.");
  
      return {
        success: true,
        discount: promotion.value,
        message: `${promotion.value}% discount applied successfully.`,
      };
    }
  
    async fetchAvailableShows(date: string) {
      console.log("Fetching available shows...");
  
      const shows = await this.showController.getShowsByDate(date);
      if (shows.length === 0) throw new Error(`No shows available for the date: ${date}.`);
  
      return shows;
    }
  
    async addBooking(userId: string, bookingData: { showId: string; seats: number[] }) {
      console.log("Adding booking...");
  
      const { showId, seats } = bookingData;
      await this.reserveSeats(userId, showId, seats);
  
      await this.userController.addBookingToHistory(userId, {
        ...bookingData,
        timestamp: new Date().toISOString(),
      });
  
      console.log("Booking successfully added.");
      return { success: true, message: "Booking successfully added!" };
    }
  
    async cancelBooking(userId: string, bookingId: string, showId: string, seats: number[]) {
      console.log("Cancelling booking...");
  
      await Promise.all([
        this.showController.releaseSeats(showId, seats),
        this.userController.removeBookingFromHistory(userId, bookingId),
      ]);
  
      console.log(`Booking ${bookingId} canceled for user ${userId}.`);
      return { success: true, message: "Booking successfully canceled." };
    }
  
    async fetchUserBookingHistory(userId: string) {
      console.log("Fetching user booking history...");
  
      const bookingHistory = await this.userController.getBookingHistory(userId);
      if (!bookingHistory || bookingHistory.length === 0) {
        throw new Error("No booking history found for the user.");
      }
  
      return bookingHistory;
    }
  }
  