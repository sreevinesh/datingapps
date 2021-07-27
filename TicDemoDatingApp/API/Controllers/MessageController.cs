using System.Collections.Generic;
using System.Threading.Tasks;
using API.DTOs;
using API.entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class MessageController : BaseApiContrtollers
    {
        public IUnitOfWork _UnitOfWork;

        private readonly IMapper _mapper;
        public MessageController(IMapper mapper, IUnitOfWork unitOfWork)
        {
            _UnitOfWork = unitOfWork;
            _mapper = mapper;


        }

        // [HttpPost]
        // public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
        // {
        //     var username = User.GetUsername();

        //     if (username == createMessageDto.RecipientUsername.ToLower())
        //         return BadRequest("You can't message yourself");

        //     var sender = await _userRepository.GetUserByUsernameAsync(username);
        //     var recipient = await _userRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername);

        //     if (recipient == null) return NotFound();

        //     var message = new Message
        //     {
        //         Sender = sender,
        //         Recipient = recipient,
        //         SenderUsername = sender.UserName,
        //         RecipientUsername = recipient.UserName,
        //         Content = createMessageDto.Content
        //     };

        //     _UnitOfWork.MessageRepository.AddMessage(message);

        //     if (await _UnitOfWork.Complete()) return Ok(_mapper.Map<MessageDto>(message));

        //     return BadRequest("failed to send message");

        // }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessagesForUser([FromQuery]
    MessageParams messageParams)
        {
            messageParams.Username = User.GetUsername();
            var messages = await _UnitOfWork.MessageRepository.GetMessageForUser(messageParams);
            Response.AddPaginationHeader(messages.CurrentPage, messages.PageSize,
                messages.TotalCount, messages.TotalPages);

            return messages;
        }



        [HttpDelete("{id}")]
        public async Task<ActionResult> Deletemessage(int id)
        {
            var username = User.GetUsername();
            var message = await _UnitOfWork.MessageRepository.GetMessage(id);
            if (message.Sender.UserName != username && message.Recipient.UserName != username)
                return Unauthorized();

            if (message.Sender.UserName == username) message.SenderDeleted = true;

            if (message.Recipient.UserName == username) message.RecipientDeleted = true;

            if (message.SenderDeleted && message.RecipientDeleted)
                _UnitOfWork.MessageRepository.DeleteMessage(message);

            if (await _UnitOfWork.Complete()) return Ok();

            return BadRequest("problem in deleting the message");
        }
    }
}